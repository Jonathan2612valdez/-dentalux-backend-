// server.js - Backend completo para procesar pagos con MercadoPago

const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://tu-frontend.netlify.app', 'https://tu-dominio.com'],
    credentials: true
}));
app.use(express.json());

// Configurar MercadoPago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const payment = new Payment(client);

// Endpoint de salud
app.get('/health', (req, res) => {
    console.log('Health check solicitado');
    res.status(200).json({ 
        status: 'ok', 
        message: 'Backend DENTALUX funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Endpoint para procesar pagos con tarjeta
app.post('/api/process-payment', async (req, res) => {
    console.log('🔥 Procesando pago con tarjeta...');
    console.log('📥 Datos recibidos:', req.body);

    try {
        const {
            token,
            transaction_amount,
            description,
            payment_method_id,
            installments,
            issuer_id,
            payer,
            metadata
        } = req.body;

        // Validaciones básicas
        if (!token || !transaction_amount || !payer?.email) {
            return res.status(400).json({
                error: 'Faltan datos requeridos',
                required: ['token', 'transaction_amount', 'payer.email']
            });
        }

        // Crear el pago
        const paymentData = {
            token,
            transaction_amount: Number(transaction_amount),
            description: description || 'Suscripción DENTALUX',
            payment_method_id,
            installments: Number(installments) || 1,
            issuer_id: issuer_id ? Number(issuer_id) : undefined,
            payer: {
                email: payer.email,
                identification: payer.identification || {
                    type: 'DNI',
                    number: '12345678'
                }
            },
            metadata: metadata || {}
        };

        console.log('📤 Enviando a MercadoPago:', paymentData);

        const response = await payment.create({ body: paymentData });
        
        console.log('✅ Respuesta de MercadoPago:', response);

        // Simular activación de suscripción si el pago es aprobado
        if (response.status === 'approved') {
            console.log('✅ Pago aprobado - Activando suscripción...');
            // Aquí agregarías tu lógica para activar la suscripción
            // Por ejemplo: crear usuario en base de datos, enviar email, etc.
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('❌ Error procesando pago:', error);
        
        res.status(500).json({
            error: 'Error procesando el pago',
            message: error.message,
            details: error.cause || null
        });
    }
});

// Endpoint para pagos alternativos (OXXO, transferencia)
app.post('/api/process-alternative-payment', async (req, res) => {
    console.log('🏪 Procesando pago alternativo...');
    console.log('📥 Datos recibidos:', req.body);

    try {
        const {
            transaction_amount,
            description,
            payment_method_id,
            payer,
            metadata
        } = req.body;

        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: description || 'Suscripción DENTALUX',
            payment_method_id,
            payer: {
                email: payer.email
            },
            metadata: metadata || {}
        };

        console.log('📤 Enviando pago alternativo a MercadoPago:', paymentData);

        const response = await payment.create({ body: paymentData });
        
        console.log('✅ Respuesta de pago alternativo:', response);

        res.status(200).json(response);

    } catch (error) {
        console.error('❌ Error en pago alternativo:', error);
        
        res.status(500).json({
            error: 'Error procesando el pago alternativo',
            message: error.message
        });
    }
});

// Endpoint para activar suscripción
app.post('/api/activate-subscription', async (req, res) => {
    console.log('🎯 Activando suscripción...');
    console.log('📥 Datos recibidos:', req.body);

    try {
        const { payment_id, plan, email, name, phone } = req.body;

        // Aquí implementarías tu lógica de activación:
        // 1. Crear usuario en base de datos
        // 2. Asignar plan
        // 3. Enviar credenciales por email
        // 4. Configurar fecha de vencimiento
        
        console.log('✅ Suscripción activada exitosamente');
        
        res.status(200).json({
            success: true,
            message: 'Suscripción activada correctamente',
            user: {
                email,
                plan,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('❌ Error activando suscripción:', error);
        
        res.status(500).json({
            error: 'Error activando la suscripción',
            message: error.message
        });
    }
});

// Webhook para recibir notificaciones de MercadoPago
app.post('/webhook', (req, res) => {
    console.log('🔔 Webhook recibido de MercadoPago:', req.body);
    
    // Procesar la notificación
    if (req.body.type === 'payment') {
        console.log('💳 Notificación de pago:', req.body.data.id);
        // Aquí actualizarías el estado del pago en tu base de datos
    }
    
    res.sendStatus(200);
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('❌ Error no manejado:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔧 Access Token configurado: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? 'SÍ' : 'NO'}`);
    console.log(`📍 Endpoints disponibles:`);
    console.log(`   GET  /health`);
    console.log(`   POST /api/process-payment`);
    console.log(`   POST /api/process-alternative-payment`);
    console.log(`   POST /api/activate-subscription`);
    console.log(`   POST /webhook`);
});

module.exports = app;