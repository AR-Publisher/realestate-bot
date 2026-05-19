# PropMatch AI — Real Estate Lead Qualification Bot

An AI-powered property qualification bot built for Aiaura Solutions hiring task.

## Tech Stack
- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

---

## Database Schema

### properties
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Property title |
| price | NUMERIC | Price in PKR |
| location | TEXT | Area/city |
| bedrooms | INTEGER | Number of bedrooms |
| type | TEXT | 'buy' or 'rent' |
| description | TEXT | Property details |
| area_sqft | INTEGER | Size in sqft |
| amenities | TEXT[] | List of amenities |
| created_at | TIMESTAMP | Auto-set |

### leads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Lead's name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| budget | NUMERIC | Budget in PKR |
| location_preference | TEXT | Preferred area |
| bedrooms | INTEGER | Required bedrooms |
| deal_type | TEXT | 'buy' or 'rent' |
| timeline | TEXT | Purchase timeline |
| classification | TEXT | Hot/Warm/Cold |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |

### conversations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lead_id | UUID | Foreign key → leads |
| role | TEXT | 'user' or 'assistant' |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Auto-set |

---

## Assumptions
- Properties are based in Pakistan (PKR pricing)
- Lead classification logic: Hot = ready now + realistic budget, Warm = 3-6 months, Cold = browsing
- No auth required for dashboard (internal sales tool)
- GPT-4o-mini used for cost efficiency

## Known Limitations
- No user authentication on dashboard
- Property images are placeholder (no image uploads)
- Email notifications are visual-only (no real email sending)
