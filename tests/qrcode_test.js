const request = require('supertest');

describe('QR code endpoint', () => {
  it('should generate and upload QR code successfully', async () => {
    const data = 'https://example.com';
    const file_extension = 'png';
    const type = 'url';
    const response = await request(app)
      .post('/qrcode')
      .send({ type, data, file_extension });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('file_name');
  });

  it('should fail if type is invalid', async () => {
    const data = 'https://example.com';
    const file_extension = 'png';
    const type = 'invalid_type';
    const response = await request(app)
      .post('/qrcode')
      .send({ type, data, file_extension });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Invalid type');
  });

  it('should fail if URL is invalid', async () => {
    const data = 'invalid_url';
    const file_extension = 'png';
    const type = 'url';
    const response = await request(app)
      .post('/qrcode')
      .send({ type, data, file_extension });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Invalid URL');
  });

  it('should fail if file extension is missing', async () => {
    const data = 'https://example.com';
    const type = 'url';
    const response = await request(app)
      .post('/qrcode')
      .send({ type, data });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Missing file extension');
  });

  it('should upload QR code to Cloudinary and return URL and file name', async () => {
    const response = await request(app)
      .post('/qrcode')
      .send({ type: 'url', data: 'https://example.com', file_extension: 'png' });
    expect(response.status).toBe(200);
    expect(response.body.url).toMatch(/^https:\/\/res\.cloudinary\.com\/\w+\/image\/upload\/\w+\.png$/);
    expect(response.body.file_name).toMatch(/^\w+$/);
  });
});