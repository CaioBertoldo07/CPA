import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env, isProduction } from './env';

const swaggerServerUrl = env.SWAGGER_SERVER_URL
    ? env.SWAGGER_SERVER_URL
    : isProduction
        ? '/'
        : `http://localhost:${env.PORT}`;

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CPA API',
            version: '1.0.0',
            description: 'API documentation for the CPA backend system.',
        },
        servers: [
            {
                url: swaggerServerUrl,
                description: isProduction ? 'Production Server' : 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Path to the API docs (all controllers)
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    if (isProduction && !env.ENABLE_SWAGGER) {
        return;
    }

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'CPA API Documentation'
    }));
};
