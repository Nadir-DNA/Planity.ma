import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CODES_FILE = path.resolve(process.cwd(), 'data', 'codes-promo.json')

function loadCodes() {
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8')).codes
  } catch {
    return []
  }
}

function saveCodes(codes: any[]) {
  const dir = path.dirname(CODES_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(CODES_FILE, JSON.stringify({ codes }, null, 2))
}

// GET /api/promo/validate?code=PLANITY-FDA4-7F2B
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Code requis' }, { status: 400 })
  }

  const codes = loadCodes()
  const found = codes.find((c: any) => c.code === code.toUpperCase())

  if (!found) {
    return NextResponse.json({ valid: false, error: 'Code invalide' }, { status: 404 })
  }

  if (!found.active) {
    return NextResponse.json({ valid: false, error: 'Code désactivé' }, { status: 410 })
  }

  if (found.max_uses > 0 && found.used_count >= found.max_uses) {
    return NextResponse.json({ valid: false, error: 'Code déjà utilisé' }, { status: 410 })
  }

  return NextResponse.json({
    valid: true,
    code: found.code,
    discount: found.discount,
    duration_months: found.duration_months,
    description: found.description,
  })
}

// POST /api/promo/use
// Body: { code: "PLANITY-FDA4-7F2B", userId: "xxx" }
export async function POST(req: Request) {
  const body = await req.json()
  const { code, userId } = body

  if (!code || !userId) {
    return NextResponse.json({ error: 'code et userId requis' }, { status: 400 })
  }

  const codes = loadCodes()
  const idx = codes.findIndex((c: any) => c.code === code.toUpperCase())

  if (idx === -1) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 404 })
  }

  if (!codes[idx].active) {
    return NextResponse.json({ error: 'Code désactivé' }, { status: 410 })
  }

  if (codes[idx].max_uses > 0 && codes[idx].used_count >= codes[idx].max_uses) {
    return NextResponse.json({ error: 'Code déjà utilisé' }, { status: 410 })
  }

  codes[idx].used_count += 1
  codes[idx].used_by = codes[idx].used_by || []
  codes[idx].used_by.push({ userId, usedAt: new Date().toISOString() })
  saveCodes(codes)

  return NextResponse.json({
    success: true,
    code: codes[idx].code,
    discount: codes[idx].discount,
    duration_months: codes[idx].duration_months,
  })
}
