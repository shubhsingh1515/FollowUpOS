import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { config } from '../config/config.js'

describe('FollowUpOS V2 API Endpoints', () => {
  const token = jwt.sign(
    {
      userId: '64f1a2b3c4d5e6f7a8b9c0d1',
      organizationId: '64f1a2b3c4d5e6f7a8b9c0d2',
      role: 'owner',
    },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  )

  test('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.database).toBeDefined()
  })

  test('POST /api/public/webhook/lead should ingest inbound lead without auth', async () => {
    const payload = {
      name: 'Priya Sharma',
      email: 'priya@apexbrand.in',
      phone: '+91 98111 22334',
      company: 'Apex Brand Labs',
      serviceRequired: 'Sales Automation & Cadences',
      budget: 150000,
      timeline: 'immediate',
      source: 'website_contact_form',
    }

    const res = await request(app)
      .post('/api/public/webhook/lead')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.leadId).toBeDefined()
    expect(res.body.data.score).toBe(85)
  })

  test('GET /api/public/widget/org_live_8849 should return active widget config', async () => {
    const res = await request(app).get('/api/public/widget/org_live_8849')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toContain('Get in Touch')
    expect(res.body.data.fields.length).toBeGreaterThan(0)
  })

  test('POST /api/leads/check-duplicate should detect duplicate leads with auth', async () => {
    const res = await request(app)
      .post('/api/leads/check-duplicate')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'priya@techstartup.in' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.isDuplicate).toBe(true)
  })

  test('POST /api/copilot/query should answer sales queries with auth', async () => {
    const res = await request(app)
      .post('/api/copilot/query')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: 'Which leads need follow up today?' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.answer).toBeDefined()
  })

  test('GET /api/campaigns should list cold revival campaigns with auth', async () => {
    const res = await request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.campaigns.length).toBeGreaterThan(0)
  })
})
