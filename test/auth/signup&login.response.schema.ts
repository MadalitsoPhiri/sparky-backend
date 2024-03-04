export const signupSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    statusCode: {
      type: 'integer',
    },
    data: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
        },
        user_name: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        profile_picture_url: {
          type: 'string',
        },
        type: {
          type: 'string',
        },
        access_token: {
          type: 'string',
        },
      },
      required: [
        '_id',
        'user_name',
        'email',
        'profile_picture_url',
        'type',
        'access_token',
      ],
    },
    message: {
      type: 'string',
    },
  },
  required: ['statusCode', 'data', 'message'],
};
