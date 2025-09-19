const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-tu-access-token-aqui'
});

const payment = new Payment(client);

app.post('/api/process-payment', async (req, res) => {
    try {
        const requestOptions = {
            body: {
                transaction_amount: Number(req.body.transaction_amount),
                token: req.body.token,
                description: req.body.description,
                installments: Number(req.body.installments),
                payment_method_id: req.body.payment_method_id,
                issuer_id: Number(req.body.issuer_id),
                payer: req.body.payer,
                metadata: req.body.metadata
            }
        };

        const result = await payment.create(requestOptions);
        
        if (result.status === 'approved') {
            console.log('Pago aprobado para:', req.body.metadata.email);
        }

        res.json(result);
    } catch (error) {
        console.error('Error procesando pago:', error);
        res.status(500).json({ error: 'Error procesando el pago' });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'DENTALUX Backend funcionando!' });
});

app.listen(PORT, () => {
    console.log('Servidor corriendo en puerto ' + PORT);
});