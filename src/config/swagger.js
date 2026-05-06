import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BildyApp API',
      version: '1.0.0',
      description: 'API REST para digitalización de albaranes entre clientes y proveedores',
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: 'Servidor local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            surnames: { type: 'string' },
            nif: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['user', 'guest', 'admin'] },
            status: { type: 'string', enum: ['pending', 'active'] },
            company: { type: 'string' },
          },
        },
        Company: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            cif: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
            logoUrl: { type: 'string' },
            owner: { type: 'string' },
          },
        },
        Address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            number: { type: 'string' },
            postal: { type: 'string' },
            city: { type: 'string' },
            province: { type: 'string' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            cif: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
            user: { type: 'string' },
            company: { type: 'string' },
            deleted: { type: 'boolean' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            projectCode: { type: 'string' },
            client: { type: 'string' },
            user: { type: 'string' },
            company: { type: 'string' },
            address: { $ref: '#/components/schemas/Address' },
            email: { type: 'string' },
            notes: { type: 'string' },
            active: { type: 'boolean' },
            deleted: { type: 'boolean' },
          },
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            format: { type: 'string', enum: ['material', 'hours'] },
            description: { type: 'string' },
            workDate: { type: 'string', format: 'date' },
            material: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            hours: { type: 'number' },
            workers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hours: { type: 'number' },
                },
              },
            },
            signed: { type: 'boolean' },
            signatureUrl: { type: 'string' },
            pdfUrl: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'integer' },
            totalPages: { type: 'integer' },
            currentPage: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
