const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'ClipS API',
    version: '1.0.0',
    description: 'Interactive API documentation for the ClipS backend.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
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
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'API health status',
          },
        },
      },
    },
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Versioned health check',
        responses: {
          200: {
            description: 'API health status',
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered' },
          400: { description: 'Validation error' },
          409: { description: 'Duplicate username/email' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated user' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get own profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' },
        },
      },
    },
    '/api/v1/users/updateMe': {
      patch: {
        tags: ['Users'],
        summary: 'Update own profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  bio: { type: 'string' },
                  avatarKey: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          409: { description: 'Username exists' },
        },
      },
    },
    '/api/v1/users/preferences': {
      patch: {
        tags: ['Users'],
        summary: 'Update notification preferences',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  inApp: {
                    type: 'object',
                    properties: {
                      followers: { type: 'boolean' },
                      comments: { type: 'boolean' },
                      likes: { type: 'boolean' },
                      tips: { type: 'boolean' },
                    },
                  },
                  email: {
                    type: 'object',
                    properties: {
                      followers: { type: 'boolean' },
                      comments: { type: 'boolean' },
                      likes: { type: 'boolean' },
                      tips: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Preferences updated' },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get public user profile',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Public profile' },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/v1/users/{id}/follow': {
      post: {
        tags: ['Follows'],
        summary: 'Follow a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Followed user' },
          409: { description: 'Already following' },
        },
      },
    },
    '/api/v1/users/{id}/unfollow': {
      delete: {
        tags: ['Follows'],
        summary: 'Unfollow a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Unfollowed user' },
        },
      },
    },
    '/api/v1/users/{id}/followers': {
      get: {
        tags: ['Follows'],
        summary: 'List user followers',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Followers list' },
        },
      },
    },
    '/api/v1/users/{id}/following': {
      get: {
        tags: ['Follows'],
        summary: 'List users followed by user',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Following list' },
        },
      },
    },
    '/api/v1/videos': {
      post: {
        tags: ['Videos'],
        summary: 'Create video',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'duration'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  videoURL: { type: 'string' },
                  duration: { type: 'number', maximum: 300 },
                  status: { type: 'string', enum: ['public', 'private', 'flagged'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Video created' },
        },
      },
      get: {
        tags: ['Videos'],
        summary: 'List public videos',
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 20 },
          },
          {
            in: 'query',
            name: 'skip',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: { description: 'Video list' },
        },
      },
    },
    '/api/v1/videos/{id}': {
      patch: {
        tags: ['Videos'],
        summary: 'Update video',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Video updated' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Videos'],
        summary: 'Delete video',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Video deleted' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/v1/admin/overview': {
      get: {
        tags: ['Admin'],
        summary: 'Admin overview',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin overview' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/api/v1/admin/health': {
      get: {
        tags: ['Admin'],
        summary: 'Admin health info',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin health data' },
        },
      },
    },
    '/api/v1/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Admin statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin statistics' },
        },
      },
    },
    '/api/v1/admin/moderation': {
      get: {
        tags: ['Admin'],
        summary: 'Moderation queue',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Moderation data' },
        },
      },
    },
    '/api/v1/admin/users/{id}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Update user account status',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['active'],
                properties: {
                  active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User account status updated' },
          403: { description: 'Admin only' },
          404: { description: 'User not found' },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec,
};
