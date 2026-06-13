const port = process.env.PORT || 5000;
const host = process.env.API_BASE_URL || `http://localhost:${port}`;

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Auto Training Academy API',
    version: '1.0.1',
    description: 'API documentation for authentication, content, payments, and admin operations.'
  },
  servers: [
    {
      url: host,
      description: 'Current API server'
    }
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
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', additionalProperties: true }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Server error' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check endpoint',
        responses: {
          200: {
            description: 'Service status',
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error or user already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user and get token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authentication successful' },
          400: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile data' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Get all courses with pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of courses' }
        }
      },
      post: {
        tags: ['Courses'],
        summary: 'Create a new course',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'price', 'level', 'category'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  category: { type: 'string' },
                  duration: {
                    type: 'object',
                    properties: {
                      weeks: { type: 'number' },
                      hours: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Course created' },
          403: { description: 'Forbidden - Admin only' }
        }
      }
    },
    '/api/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Get a single course by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Course details' },
          404: { description: 'Course not found' }
        }
      },
      put: {
        tags: ['Courses'],
        summary: 'Update an existing course',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Course updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Course not found' }
        }
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete a course',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Course deleted' },
          403: { description: 'Forbidden' }
        }
      }
    },
    \u0027/api/videos/youtube/{courseId}\u0027: {\n      post: {\n        tags: [\u0027Videos\u0027],\n        summary: \u0027Add a YouTube video to a course\u0027,\n        security: [{ bearerAuth: [] }],\n        parameters: [{ name: \u0027courseId\u0027, in: \u0027path\u0027, required: true, schema: { type: \u0027string\u0027 } }],\n        responses: {\n          201: { description: \u0027Video added\u0027 },\n          403: { description: \u0027Forbidden\u0027 }\n        }\n      }\n    },\n    \u0027/api/agent/chat\u0027: {\n      post: {\n        tags: [\u0027AI Agent\u0027],\n        summary: \u0027Chat with the AddAuto Assistant\u0027,\n        requestBody: {\n          required: true,\n          content: {\n            \u0027application/json\u0027: {\n              schema: {\n                type: \u0027object\u0027,\n                required: [\u0027query\u0027],\n                properties: {\n                  query: { type: \u0027string\u0027 }\n                }\n              }\n            }\n          }\n        },\n        responses: {\n          200: { description: \u0027AI response returned\u0027 }\n        }\n      }\n    },\n    \u0027/api/blog/posts\u0027: {\n

      get: {
        tags: ['Blog'],
        summary: 'Get published blog posts',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Published blog posts' },
          500: { description: 'Server error' }
        }
      }
    },
    '/api/blog/posts/{slug}': {
      get: {
        tags: ['Blog'],
        summary: 'Get a blog post by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Blog post details' },
          404: { description: 'Blog post not found' }
        }
      }
    },
    '/api/payment/paystack/initialize': {
      post: {
        tags: ['Payments'],
        summary: 'Initialize a Paystack payment for course enrollment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseId'],
                properties: {
                  courseId: { type: 'string' },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment initialized successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/payment/paystack/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify Paystack payment and enroll user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reference'],
                properties: {
                  reference: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment verified and enrollment completed' },
          400: { description: 'Verification failed' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/api/payment/history': {
      get: {
        tags: ['Payments'],
        summary: 'Get authenticated user payment history',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Payment history list' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin dashboard statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard stats' },
          401: { description: 'Unauthorized' },
          403: { description: 'Admin access required' }
        }
      }
    }
  }
};
