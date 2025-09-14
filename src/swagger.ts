import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskyNet Mobile API',
      version: '1.0.0',
      description: 'API documentation for TaskyNet mobile employees and admin authentication.'
    },
    servers: [
      { url: 'https://taskynet-backend-latest.onrender.com/api', description: 'Production server' },
      { url: 'http://localhost:8080/api', description: 'Local server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@taskynet.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123'
            }
          }
        },
        SignupRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@taskynet.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: {
              type: 'string',
              example: 'oldpassword123'
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              example: 'newpassword123'
            }
          }
        },
        PaymentRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              minimum: 0,
              example: 100.50
            }
          }
        },
        CommentRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              maxLength: 1000,
              example: 'Task completed successfully'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/authRoutes.ts', './src/routes/employeeRoutes.ts'], // Only scan auth and employee routes
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
