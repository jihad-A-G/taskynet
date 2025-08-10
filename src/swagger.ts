import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskyNet API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for TaskyNet admin and employee endpoints.'
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Local server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Scan routes/controllers for JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
