/**
 * enrich-spotify-assets.js
 *
 * Dev-only utility. Reads data/home-seed.json, searches Spotify for real
 * track/album metadata, and writes an enriched copy to
 * data/home-seed.spotify.json.
 *
 * Usage:
 *   node scripts/enrich-spotify-assets.js --dry-run   (featured + 2 items)
 *   node scripts/enrich-spotify-assets.js             (full dataset)
 *
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dirname, '..');
const INPUT   = join(ROOT, 'data/home-seed.json');
const OUTPUT  = join(ROOT, 'data/home-seed.spotify.json');
const DRY_RUN = process.argv.includes('--dry-run');

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌  SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env');
  process.exit(1);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Spotify auth failed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ── Search ────────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function spotifyFetch(token, url, retried = false) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 429) {
    const wait = parseInt(res.headers.get('Retry-After') ?? '5', 10);
    if (!retried) {
      console.log(`  ⏳  Rate limited — waiting ${wait}s...`);
      await sleep(wait * 1000);
      return spotifyFetch(token, url, true);
    }
    throw new Error(`Rate limited twice on ${url}`);
  }

  if (!res.ok) throw new Error(`Spotify API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function searchSpotify(token, query, type) {
  const q   = encodeURIComponent(query);
  const url = `https://api.spotify.com/v1/search?q=${q}&type=${type}&limit=5`;
  return spotifyFetch(token, url);
}

// ── Result extraction ─────────────────────────────────────────────────────────

function extractTrack(data) {
  const track = data.tracks?.items?.[0];
  if (!track) return null;
  return {
    spotifyType:      'track',
    spotifyId:        track.id,
    spotifyUri:       track.uri,
    spotifyUrl:       track.external_urls?.spotify ?? null,
    cover:            track.album?.images?.[0]?.url ?? null,
    spotifyName:      track.name,
    spotifyArtist:    track.artists?.[0]?.name ?? null,
    spotifyAlbumName: track.album?.name ?? null,
  };
}

function extractAlbum(data) {
  const album = data.albums?.items?.[0];
  if (!album) return null;
  return {
    spotifyType:   'album',
    spotifyId:     album.id,
    spotifyUri:    album.uri,
    spotifyUrl:    album.external_urls?.spotify ?? null,
    cover:         album.images?.[0]?.url ?? null,
    spotifyName:   album.name,
    spotifyArtist: album.artists?.[0]?.name ?? null,
  };
}

// ── Enrich one signal ─────────────────────────────────────────────────────────

async function enrichSignal(token, item) {
  const query = item.artist ? `${item.artist} ${item.title}` : item.title;

  let searchType;
  if      (item.type === 'Album') searchType = 'album';
  else if (item.type === 'Song')  searchType = 'track';
  else                            searchType = 'track,album';

  try {
    const data   = await searchSpotify(token, query, searchType);
    await sleep(150);

    let result = null;
    if      (searchType === 'track')       result = extractTrack(data);
    else if (searchType === 'album')       result = extractAlbum(data);
    else /* track,album — prefer track */  result = extractTrack(data) ?? extractAlbum(data);

    if (!result) {
      console.log(`  ⚠  No result for: "${query}"`);
      return item;
    }

    console.log(`  ✓  ${item.id.padEnd(20)} ${result.spotifyType.padEnd(6)} ${result.spotifyName} — ${result.spotifyArtist}`);
    return { ...item, ...result };
  } catch (err) {
    console.error(`  ✗  ${item.id}: ${err.message}`);
    return item;
  }
}

// ── Collect all enrichable signals ────────────────────────────────────────────

function collectSignals(seed) {
  const signals = [];
  if (seed.bestPicksForYou?.featured)    signals.push(seed.bestPicksForYou.featured);
  signals.push(...(seed.bestPicksForYou?.items    ?? []));
  signals.push(...(seed.oneStepAway?.items        ?? []));
  signals.push(...(seed.deepUnderground?.items    ?? []));
  signals.push(...(seed.breakingOut?.items        ?? []));
  if (seed.outsideTheBubble?.featured)   signals.push(seed.outsideTheBubble.featured);
  signals.push(...(seed.outsideTheBubble?.sideItems ?? []));
  signals.push(...(seed.drift?.stream   ?? []));
  return signals;
}

// ── Rebuild seed with enriched data ──────────────────────────────────────────

function applyEnriched(seed, enrichedMap) {
  const e = item => enrichedMap.get(item.id) ?? item;

  return {
    ...seed,
    bestPicksForYou: {
      ...seed.bestPicksForYou,
      featured: seed.bestPicksForYou?.featured ? e(seed.bestPicksForYou.featured) : null,
      items:    (seed.bestPicksForYou?.items ?? []).map(e),
    },
    oneStepAway:     { ...seed.oneStepAway,     items:     (seed.oneStepAway?.items    ?? []).map(e) },
    deepUnderground: { ...seed.deepUnderground, items:     (seed.deepUnderground?.items ?? []).map(e) },
    breakingOut:     { ...seed.breakingOut,     items:     (seed.breakingOut?.items     ?? []).map(e) },
    outsideTheBubble: {
      ...seed.outsideTheBubble,
      featured:  seed.outsideTheBubble?.featured ? e(seed.outsideTheBubble.featured) : null,
      sideItems: (seed.outsideTheBubble?.sideItems ?? []).map(e),
    },
    drift: { ...seed.drift, stream: (seed.drift?.stream ?? []).map(e) },
    // humanSignals and originStories pass through unchanged
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(INPUT)) {
    console.error(`❌  Input file not found: ${INPUT}`);
    process.exit(1);
  }

  const seed  = JSON.parse(readFileSync(INPUT, 'utf-8'));
  const token = await getAccessToken();
  console.log('✓  Spotify auth OK\n');

  // ── Dry run ──────────────────────────────────────────────────────────────────
  if (DRY_RUN) {
    console.log('🔍  DRY RUN — testing featured + first item of 2 lanes\n');

    const testItems = [
      seed.bestPicksForYou?.featured,
      seed.bestPicksForYou?.items?.[0],
      seed.oneStepAway?.items?.[0],
    ].filter(Boolean);

    for (const item of testItems) {
      const query = item.artist ? `${item.artist} ${item.title}` : item.title;
      const enriched = await enrichSignal(token, item);

      console.log('');
      console.log(`  id:      ${item.id}`);
      console.log(`  query:   "${query}"`);
      console.log(`  name:    ${enriched.spotifyName    ?? '—'}`);
      console.log(`  artist:  ${enriched.spotifyArtist  ?? '—'}`);
      console.log(`  type:    ${enriched.spotifyType    ?? '—'}`);
      console.log(`  cover:   ${enriched.cover          ?? '—'}`);
    }

    console.log('\n✅  Dry run complete.');
    console.log('    Run without --dry-run to process the full dataset.\n');
    return;
  }

  // ── Full run ─────────────────────────────────────────────────────────────────
  const signals = collectSignals(seed);
  console.log(`🚀  Enriching ${signals.length} signals...\n`);

  const enrichedMap = new Map();
  let enriched = 0;
  let noMatch  = 0;

  for (const item of signals) {
    const result = await enrichSignal(token, item);
    enrichedMap.set(item.id, result);
    if (result.spotifyId) enriched++;
    else                  noMatch++;
  }

  const output = applyEnriched(seed, enrichedMap);

  const dataDir = join(ROOT, 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n✅  Done.');
  console.log(`   Output:    ${OUTPUT}`);
  console.log(`   Enriched:  ${enriched} / ${signals.length}`);
  console.log(`   No match:  ${noMatch}\n`);

  console.log('Sample enriched entries:\n');
  let shown = 0;
  for (const item of enrichedMap.values()) {
    if (item.spotifyId && shown < 3) {
      console.log(JSON.stringify(item, null, 2));
      shown++;
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
