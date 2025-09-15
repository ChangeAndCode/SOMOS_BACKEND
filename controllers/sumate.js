import nodemailer from 'nodemailer';
import { normalizeFormData } from '../utils/validation.js';
import Sumate from '../models/Sumate.js';

const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

export const sendEmail = async (req, res) => {
    try {
        // Normalizar los datos del formulario
        const normalizedData = normalizeFormData(req.body);
        
        const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !normalizedData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Faltan los siguientes campos requeridos: ${missingFields.join(', ')}`
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedData.email)) {
            return res.status(400).json({
                success: false,
                message: 'El formato del email no es válido'
            });
        }

        let volunteerRecord;
        try {
            volunteerRecord = new Sumate({
                firstName: normalizedData.firstName,
                lastName: normalizedData.lastName,
                email: normalizedData.email,
                phone: normalizedData.phone,
                birthDate: normalizedData.birthDate || null,
                profession: normalizedData.profession || '',
                availability: normalizedData.availability || '',
                availabilityDetails: normalizedData.availabilityDetails || '',
                interests: normalizedData.interests || '',
                experience: normalizedData.experience || '',
                motivation: normalizedData.motivation || '',
                comments: normalizedData.comments || ''
            });

            await volunteerRecord.save();
            console.log('✅ Registro de voluntario guardado en BD:', volunteerRecord._id);

        } catch (dbError) {
            console.error('Error al guardar en la base de datos:', dbError);
            
            // Si hay errores de validación de Mongoose, los enviamos al cliente
            if (dbError.name === 'ValidationError') {
                const validationErrors = Object.values(dbError.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación de datos',
                    errors: validationErrors
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error al guardar la información del voluntario'
            });
        }

        // Crear el transportador de correo
        const transporter = createTransporter();

        // Verificar la configuración del transportador
        await transporter.verify();

        // Mapear los valores de disponibilidad para mostrar en el correo
        const availabilityLabels = {
            'weekday_morning': 'Entre semana - Mañana',
            'weekday_afternoon': 'Entre semana - Tarde',
            'weekday_evening': 'Entre semana - Noche',
            'weekend_morning': 'Fin de semana - Mañana',
            'weekend_afternoon': 'Fin de semana - Tarde',
            'weekend_evening': 'Fin de semana - Noche',
            'flexible': 'Horario flexible'
        };

        // Crear el contenido del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
            subject: 'Nuevo Voluntario - Formulario Súmate',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #8a3677; border-bottom: 2px solid #8a3677; padding-bottom: 10px;">
                        🚀 Nuevo Voluntario - Súmate
                    </h2>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #8a3677; margin-top: 0;">👤 Información Personal:</h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 30%;">
                                    Nombre:
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                                    ${normalizedData.firstName} ${normalizedData.lastName}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">
                                    Email:
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                                    <a href="mailto:${normalizedData.email}" style="color: #8a3677;">
                                        ${normalizedData.email}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">
                                    Teléfono:
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                                    <a href="tel:${normalizedData.phone}" style="color: #8a3677;">
                                        ${normalizedData.phone}
                                    </a>
                                </td>
                            </tr>
                            ${normalizedData.birthDate ? `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">
                                    Fecha de Nacimiento:
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                                    ${new Date(normalizedData.birthDate).toLocaleDateString('es-ES')}
                                </td>
                            </tr>
                            ` : ''}
                            ${normalizedData.profession ? `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">
                                    Profesión:
                                </td>
                                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                                    ${normalizedData.profession}
                                </td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    
                    ${normalizedData.availability || normalizedData.availabilityDetails ? `
                    <div style="background-color: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #8a3677; margin-top: 0;">📅 Disponibilidad:</h3>
                        ${normalizedData.availability ? `
                        <p style="margin: 5px 0;"><strong>Horario preferido:</strong> ${availabilityLabels[normalizedData.availability] || normalizedData.availability}</p>
                        ` : ''}
                        ${normalizedData.availabilityDetails ? `
                        <p style="margin: 5px 0;"><strong>Detalles:</strong> ${normalizedData.availabilityDetails}</p>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    ${normalizedData.interests ? `
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #8a3677; margin-top: 0;">💡 Áreas de Interés:</h3>
                        <p style="line-height: 1.6; margin: 0;">
                            ${normalizedData.interests.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    ` : ''}
                    
                    ${normalizedData.experience ? `
                    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #8a3677; margin-top: 0;">🎯 Experiencia:</h3>
                        <p style="line-height: 1.6; margin: 0;">
                            ${normalizedData.experience.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    ` : ''}
                    
                    ${normalizedData.motivation ? `
                    <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #8a3677; margin-top: 0;">❤️ Motivación:</h3>
                        <p style="line-height: 1.6; margin: 0;">
                            ${normalizedData.motivation.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    ` : ''}
                    
                    ${normalizedData.comments ? `
                    <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #8a3677; margin-top: 0;">💬 Comentarios Adicionales:</h3>
                        <p style="line-height: 1.6; margin: 0;">
                            ${normalizedData.comments.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
                        <p style="margin: 0;">
                            <strong>Fecha de recepción:</strong> ${new Date().toLocaleString('es-ES')}
                        </p>
                        <p style="margin: 5px 0 0 0;">
                            <strong>ID de registro:</strong> ${volunteerRecord._id}
                        </p>
                        <p style="margin: 5px 0 0 0;">
                            Este correo fue enviado automáticamente desde el formulario "Súmate como Voluntario".
                        </p>
                    </div>
                </div>
            `
        };

        // Enviar el correo
        let emailInfo = null;
        try {
            emailInfo = await transporter.sendMail(mailOptions);
            
            // Marcar el correo como enviado en la base de datos
            volunteerRecord.emailSent = true;
            volunteerRecord.emailSentAt = new Date();
            await volunteerRecord.save();
            
            console.log('📧 Correo enviado exitosamente:', emailInfo.messageId);
            
        } catch (emailError) {
            console.error('Error al enviar el correo:', emailError);
            
            // El registro ya se guardó en BD, pero falló el correo
            // Actualizamos el estado pero no devolvemos error completo
            volunteerRecord.emailSent = false;
            await volunteerRecord.save();
        }

        // Responder al cliente
        res.status(200).json({
            success: true,
            message: 'Solicitud de voluntariado recibida exitosamente. Nos pondremos en contacto contigo pronto.',
            data: {
                registrationId: volunteerRecord._id,
                emailSent: volunteerRecord.emailSent,
                messageId: emailInfo?.messageId || null,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error general en sendEmail:', error);

        // Manejar diferentes tipos de errores
        let errorMessage = 'Error interno del servidor al procesar el formulario';
        let statusCode = 500;

        if (error.code === 'EAUTH') {
            errorMessage = 'Error de autenticación con el servicio de correo';
            statusCode = 503;
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'No se pudo conectar con el servicio de correo';
            statusCode = 503;
        } else if (error.responseCode === 554) {
            errorMessage = 'El correo fue rechazado por el servidor';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener todos los registros de voluntarios (para administradores)
export const getVolunteers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            emailSent,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Construir filtros
        const filters = {};
        if (status) filters.status = status;
        if (emailSent !== undefined) filters.emailSent = emailSent === 'true';

        // Construir ordenamiento
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Ejecutar consulta con paginación
        const volunteers = await Sumate.find(filters)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v'); // Excluir el campo __v

        const total = await Sumate.countDocuments(filters);

        res.status(200).json({
            success: true,
            data: {
                volunteers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener voluntarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los registros de voluntarios'
        });
    }
};
