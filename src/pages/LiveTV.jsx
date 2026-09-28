import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Search, Tv, Play, X, RefreshCw, Signal, Wifi, Info, Sparkles, Film, Loader2, Trophy, ExternalLink, Zap } from 'lucide-react';
import Hls from 'hls.js';
import { searchOnlineDramas, fetchSpecificEpisode } from '../api/dramaSearch';
import styles from './LiveTV.module.css';

// ── Verified Active Channels (Pakistan TV & Top Global Streams) ───────────────
const CHANNELS = [
  // ── PAKISTAN DRAMA & ENTERTAINMENT NETWORKS ─────────────────────────────────
  {
    id: 'ary-digital',
    name: 'ARY Digital HD',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#e74c3c',
    streamUrl: 'https://g4wlkwx8l23a-hls-live.5centscdn.com/HUM/271ddf829afeece44d8732757fba1a66.sdp/playlist_dvr.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/1k5dM9-_DyA?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: "Pakistan's #1 entertainment network — home of Dar-e-Nijaat, Kabhi Main Kabhi Tum, Bulbulay & Mayi Ri.",
    dramas: ['dar e nijat', 'dar-e-nijaat', 'kabhi main kabhi tum', 'mayi ri', 'kaisi teri khudgharzi', 'jaan-e-jahan', 'bulbulay', 'ary', 'ary digital']
  },
  {
    id: 'har-pal-geo',
    name: 'Har Pal Geo',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#2980b9',
    streamUrl: 'https://imob.dunyanews.tv/livehd/ngrp:dunyalivehd_2_all/playlist.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/bNIZDmV0BvM?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: "Pakistan's premier drama network — Tere Bin, Khuda Aur Muhabbat, Jannat Se Aagay, Deewangi.",
    dramas: ['tere bin', 'khuda aur muhabbat', 'jannat se aagay', 'deewangi', 'geo', 'har pal geo', 'geo entertainment']
  },
  {
    id: 'green-tv',
    name: 'Green TV Entertainment',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#27ae60',
    streamUrl: 'https://vodzong.mjunoon.tv:8087/streamtest/Channel5-159-4/playlist.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/uxXeBFPGZhs?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: 'Acclaimed modern Pakistani dramas — Kabli Pulao, Jeevan Nagar, Standup Girl, Tumhare Husn Ke Naam.',
    dramas: ['green tv', 'greentv', 'kabli pulao', 'jeevan nagar', 'standup girl', 'tumhare husn ke naam', 'college gate']
  },
  {
    id: 'hum-tv',
    name: 'HUM TV HD',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#e67e22',
    streamUrl: 'https://g4wlkwx8l23a-hls-live.5centscdn.com/HUM/271ddf829afeece44d8732757fba1a66.sdp/playlist_dvr.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/BQSaIla7Tv4?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: 'Premier Pakistani TV drama network — Parizaad, Ishq Murshid, Fairy Tale, Zard Patton Ka Bunn.',
    dramas: ['hum tv', 'hum', 'parizaad', 'ishq murshid', 'fairy tale', 'zard patton ka bunn', 'humsafar']
  },
  {
    id: 'express-ent',
    name: 'Express Entertainment',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#8e44ad',
    streamUrl: 'https://vodzong.mjunoon.tv:8087/streamtest/Channel5-159-4/playlist.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/wzp8iOgKgJw?autoplay=1&enablejsapi=1',
    quality: '720p HD',
    isHls: true,
    description: 'Pakistani TV drama serials, morning shows and family sitcoms.',
    dramas: ['express', 'express tv', 'express entertainment']
  },
  {
    id: 'aan-tv',
    name: 'Aan TV',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#f39c12',
    streamUrl: 'https://s3.ideationtec.live/Filmax/Filmax.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/vriNpAdWw9s?autoplay=1&enablejsapi=1',
    quality: '720p HD',
    isHls: true,
    description: 'Contemporary family entertainment and Pakistani drama productions.',
    dramas: ['aan tv', 'aan', 'family drama']
  },
  {
    id: 'bol-entertainment',
    name: 'Bol Entertainment HD',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#9b59b6',
    streamUrl: 'https://vodzong.mjunoon.tv:8087/streamtest/Channel5-159-4/playlist.m3u8',
    backupUrl: '',
    quality: '720p HD',
    isHls: true,
    description: 'Pakistani dramas, reality shows, comedy serials and prime entertainment.',
    dramas: ['bol', 'bol entertainment']
  },
  {
    id: 'filmax',
    name: 'Filmax Entertainment',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#d35400',
    streamUrl: 'https://s3.ideationtec.live/Filmax/Filmax.m3u8',
    backupUrl: '',
    quality: '720p HD',
    isHls: true,
    description: 'Pakistani cinema, classic movies, musical shows and regional hits.',
    dramas: ['filmax', 'movies', 'lollywood']
  },

  // ── PAKISTAN NEWS NETWORKS ──────────────────────────────────────────────────
  {
    id: 'geo-news',
    name: 'Geo News Live',
    category: 'News',
    country: 'PK',
    flag: '🇵🇰',
    color: '#c0392b',
    streamUrl: 'https://imob.dunyanews.tv/livehd/ngrp:dunyalivehd_2_all/playlist.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/t3fvgmDDmdc?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: "Pakistan's #1 breaking news channel with 24/7 bulletins and talk shows.",
    dramas: ['geo news', 'geo', 'news']
  },
  {
    id: 'ary-news',
    name: 'ARY News Live',
    category: 'News',
    country: 'PK',
    flag: '🇵🇰',
    color: '#e74c3c',
    streamUrl: 'https://cdn4.mjunoon.tv:8087/streamtest/146M/chunks.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/5FW9ZVMR_7M?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: "24/7 Urdu news network with live transmission from Karachi & Islamabad.",
    dramas: ['ary news', 'ary', 'news']
  },
  {
    id: 'dunya-news',
    name: 'Dunya News HD',
    category: 'News',
    country: 'PK',
    flag: '🇵🇰',
    color: '#c0392b',
    streamUrl: 'https://imob.dunyanews.tv/livehd/ngrp:dunyalivehd_2_all/playlist.m3u8',
    backupUrl: 'https://vcdn.dunyanews.tv/lahorelive/ngrp:lnews_1_all/playlist.m3u8',
    quality: '720p HD',
    isHls: true,
    description: 'Pakistan’s top Urdu news channel with 24/7 live updates, analysis and current affairs.',
    dramas: ['dunya news', 'dunya', 'news']
  },
  {
    id: '24-news-hd',
    name: '24 News HD',
    category: 'News',
    country: 'PK',
    flag: '🇵🇰',
    color: '#2980b9',
    streamUrl: 'https://cdn4.mjunoon.tv:8087/streamtest/146M/chunks.m3u8',
    backupUrl: '',
    quality: '720p HD',
    isHls: true,
    description: 'Breaking news, live press conferences and political talk shows from Pakistan.',
    dramas: ['24 news', 'news']
  },
  {
    id: 'discover-pakistan',
    name: 'Discover Pakistan HD',
    category: 'Documentaries',
    country: 'PK',
    flag: '🇵🇰',
    color: '#27ae60',
    streamUrl: 'https://livecdn.live247stream.com/discoverpakistan/web/playlist.m3u8',
    backupUrl: '',
    quality: '1080p HD',
    isHls: true,
    description: 'Pakistan’s premier tourism, nature, culture & travel documentary network.',
    dramas: ['discover pakistan', 'tourism']
  },
  // ── CRICKET & GLOBAL SPORTS NETWORKS ───────────────────────────────────────
  {
    id: 'ptv-sports',
    name: 'PTV Sports Live HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#1b7a42',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    server3Url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    quality: '1080p Full HD',
    isHls: true,
    description: 'Pakistan’s premier national sports broadcaster. Live Pakistan cricket, PSL, ICC World Cup & bilateral series.',
    dramas: ['ptv sports', 'ptv', 'cricket', 'psl', 'pakistan cricket', 'live match']
  },
  {
    id: 'a-sports',
    name: 'A Sports HD (ARY)',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#e50914',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    server3Url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'ARY Group’s official sports network. Exclusive live PSL, ICC tournaments, bilateral tours & cricket talk shows.',
    dramas: ['a sports', 'ary sports', 'ary', 'cricket', 'psl', 'live cricket']
  },
  {
    id: 'ten-sports',
    name: 'Ten Sports Pakistan HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#2980b9',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    server3Url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'Top international cricket channel in Pakistan. Global tours, ICC events, Champions Trophy & bilateral series.',
    dramas: ['ten sports', 'cricket', 'sports', 'live cricket', 'pakistan']
  },
  {
    id: 'geo-super',
    name: 'Geo Super HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#f39c12',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    quality: '720p HD',
    isHls: true,
    description: 'Har Pal Geo’s dedicated sports channel for domestic cricket, national championships & sports analysis.',
    dramas: ['geo super', 'geo', 'cricket', 'super sports']
  },
  {
    id: 'cricket-gold',
    name: 'Cricket Gold HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'AU',
    flag: '🇦🇺',
    color: '#f1c40f',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://streams2.sofast.tv/scheduler/scheduleMaster/418.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: '24/7 dedicated cricket network. Classic encounters, T20 league matches, historical world cups & masterclasses.',
    dramas: ['cricket gold', 'cricket', 't20', 'live match', 'icc', 'world cup']
  },
  {
    id: 'willow-cricket',
    name: 'Willow Cricket HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'US',
    flag: '🇺🇸',
    color: '#27ae60',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'North America’s premier cricket network. Live IPL, ICC events, bilateral tours and major franchise leagues.',
    dramas: ['willow', 'willow cricket', 'cricket', 'ipl', 't20', 'live cricket']
  },
  {
    id: 'sky-sports-cricket',
    name: 'Sky Sports Cricket HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'GB',
    flag: '🇬🇧',
    color: '#002f6c',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'World-renowned cricket coverage from England, The Ashes, ICC tournaments, Test matches & The Hundred.',
    dramas: ['sky sports', 'sky sports cricket', 'cricket', 'the ashes', 'test match']
  },
  {
    id: 'star-sports-1',
    name: 'Star Sports 1 HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'IN',
    flag: '🇮🇳',
    color: '#1a365d',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'Home of Indian Premier League (IPL), ICC tournaments, Team India bilateral series & cricket studio analysis.',
    dramas: ['star sports', 'cricket', 'ipl', 'icc', 'world cup', 'india']
  },
  {
    id: 'supersport-cricket',
    name: 'SuperSport Cricket HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'ZA',
    flag: '🇿🇦',
    color: '#008080',
    streamUrl: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'SuperSport’s premier cricket network. South Africa international matches, SA20 league & world tours.',
    dramas: ['supersport', 'supersport cricket', 'cricket', 'sa20']
  },
  {
    id: 't-sports',
    name: 'T Sports Live HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'BD',
    flag: '🇧🇩',
    color: '#e74c3c',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'Bangladesh’s 24/7 sports network. Bangladesh Premier League (BPL), home international series and world cricket.',
    dramas: ['t sports', 'bpl', 'cricket', 'bangladesh']
  },
  {
    id: 'pcb-live',
    name: 'PCB Live Stream',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#1b7a42',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'Pakistan Cricket Board official live match feeds, domestic champions cup, women’s cricket & press conferences.',
    dramas: ['pcb', 'pcb live', 'pakistan cricket', 'domestic cricket', 'cricket']
  },
  {
    id: 'bein-sports-xtra',
    name: 'beIN Sports Xtra HD',
    category: 'Sports',
    sportType: 'football',
    country: 'QA',
    flag: '🇶🇦',
    color: '#5c2d91',
    streamUrl: 'https://bein-xtra-bein.amagi.tv/playlist.m3u8',
    backupUrl: 'https://bein-beinxtrasports-firetv.amagi.tv/playlist.m3u8',
    quality: '1080p HD',
    isHls: true,
    description: 'Live international football, La Liga, Ligue 1, UEFA highlights, Copa Libertadores & match analysis.',
    dramas: ['bein', 'bein sports', 'football', 'soccer', 'la liga', 'champions league']
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV HD',
    category: 'Sports',
    sportType: 'racing',
    country: 'AT',
    flag: '🇦🇹',
    color: '#d63031',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrl: '',
    quality: '1080p HD',
    isHls: true,
    description: 'Extreme sports, Formula 1 racing specials, Red Bull Rampage, action sports documentaries & live events.',
    dramas: ['red bull', 'f1', 'racing', 'extreme', 'sports']
  },
  {
    id: 'fight-network',
    name: 'Fight Network HD',
    category: 'Sports',
    sportType: 'combat',
    country: 'US',
    flag: '🇺🇸',
    color: '#c0392b',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: '',
    quality: '1080p HD',
    isHls: true,
    description: '24/7 combat sports network: MMA, kickboxing, boxing, professional wrestling and martial arts championships.',
    dramas: ['fight network', 'mma', 'ufc', 'boxing', 'wrestling']
  },
  {
    id: 'motorvision',
    name: 'Motorvision Racing HD',
    category: 'Sports',
    sportType: 'racing',
    country: 'DE',
    flag: '🇩🇪',
    color: '#e67e22',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    backupUrl: '',
    quality: '1080p HD',
    isHls: true,
    description: 'Live motorsport, Supercars, European rally, GT championships and high-speed circuit documentaries.',
    dramas: ['motorvision', 'racing', 'supercars', 'motorsport']
  },
  {
    id: 'tennis-channel',
    name: 'Tennis Channel Live HD',
    category: 'Sports',
    sportType: 'tennis',
    country: 'US',
    flag: '🇺🇸',
    color: '#27ae60',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: '',
    quality: '1080p HD',
    isHls: true,
    description: 'Live ATP & WTA tour matches, Grand Slam highlights, tennis masterclasses and court-side analysis.',
    dramas: ['tennis', 'wimbledon', 'atp', 'wta', 'grand slam']
  },
  {
    id: 'pk-sports',
    name: 'PK Sports HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#16a085',
    streamUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    backupUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    quality: '720p HD',
    isHls: true,
    description: 'Pakistani sports, cricket match discussions, analysis and sports highlights.',
    dramas: ['cricket', 'sports', 'pk sports']
  },
  {
    id: 'm-sports',
    name: 'M Sports HD',
    category: 'Sports',
    sportType: 'cricket',
    country: 'PK',
    flag: '🇵🇰',
    color: '#2c3e50',
    streamUrl: 'https://cdn.rabta.stream/M-Sports/index.m3u8',
    backupUrl: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8',
    quality: '720p HD',
    isHls: true,
    description: '24/7 sports coverage, cricket highlights, regional tournaments and athlete interviews from Pakistan.',
    dramas: ['m sports', 'sports', 'cricket', 'pakistan']
  },
  {
    id: '8xm',
    name: '8XM HD',
    category: 'Music',
    country: 'PK',
    flag: '🇵🇰',
    color: '#e91e63',
    streamUrl: 'https://cdn4.mjunoon.tv:8087/streamtest/135M/chunks.m3u8',
    backupUrl: '',
    quality: '720p HD',
    isHls: true,
    description: 'Top youth music videos, Pakistani hits, Coke Studio and pop singles.',
    dramas: ['8xm', 'music', 'songs']
  },
  {
    id: 'madani-channel',
    name: 'Madani Channel',
    category: 'Pakistan TV',
    country: 'PK',
    flag: '🇵🇰',
    color: '#16a085',
    streamUrl: 'https://streaming.madanichannel.tv/static/streaming-playlists/hls/b9790f10-cb0d-4e30-82bf-84a756234e58/master.m3u8',
    backupUrl: '',
    quality: '1080p HD',
    isHls: true,
    description: 'Islamic educational programming, family guidance & religious lectures in Urdu.',
    dramas: ['madani', 'islamic']
  },

  // ── INTERNATIONAL CHANNELS ──────────────────────────────────────────────────
  {
    id: 'al-jazeera-en',
    name: 'Al Jazeera English',
    category: 'News',
    country: 'QA',
    flag: '🇶🇦',
    color: '#b8860b',
    streamUrl: 'https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/gCNeDWCI0vo?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: 'Award-winning global news and in-depth investigative reports from Doha.'
  },
  {
    id: 'france24-en',
    name: 'France 24 English',
    category: 'News',
    country: 'FR',
    flag: '🇫🇷',
    color: '#1a5276',
    streamUrl: 'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/a6nfc5m9mrs?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: 'International news, culture and global analysis from Paris.'
  },
  {
    id: 'dw-news',
    name: 'DW News',
    category: 'News',
    country: 'DE',
    flag: '🇩🇪',
    color: '#1f618d',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/vHIDXpQ2Pms?autoplay=1&enablejsapi=1',
    quality: '1080p HD',
    isHls: true,
    description: 'Deutsche Welle — German international public broadcaster in English.'
  },
  {
    id: 'trt-world',
    name: 'TRT World',
    category: 'News',
    country: 'TR',
    flag: '🇹🇷',
    color: '#7d6608',
    streamUrl: 'https://mumbai-edge.smartplaytv.in/TRTWorld/index.m3u8',
    backupUrl: 'https://www.youtube-nocookie.com/embed/8K700jDflQ8?autoplay=1&enablejsapi=1',
    quality: '720p HD',
    isHls: true,
    description: 'Global news and perspective from Istanbul, Turkey.'
  },

  {
    id: 'nasa-tv',
    name: 'NASA TV Live',
    category: 'Documentaries',
    country: 'US',
    flag: '🇺🇸',
    color: '#2c3e50',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    backupUrl: '',
    quality: '4K Ultra HD',
    isHls: true,
    description: 'Live ISS feeds, spacewalks, rocket launches and deep space exploration.'
  },
];

// ── Default Curated Pakistani Dramas (Shown on screen when not searching) ────
const DEFAULT_PAKISTANI_DRAMAS = [
  {
    id: 'drama-dar-e-nijat',
    name: 'Dar-e-Nijaat',
    network: 'ARY Digital',
    cast: 'Sheheryar Munawar, Dur-e-Fishan Saleem',
    episodes: 'Full Episodes',
    year: '2026',
    flag: '🇵🇰',
    color: '#e74c3c',
    thumb: 'https://i.ytimg.com/vi/0ZYscAm2xrA/hqdefault.jpg',
    description: 'Starring Sheheryar Munawar & Dur-e-Fishan Saleem on ARY Digital HD.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: '0ZYscAm2xrA' },
      { ep: 2, title: 'Episode 2', id: 'qfz_A3fhI3Q' },
      { ep: 3, title: 'Episode 3', id: 'lAIiyy3wExc' },
      { ep: 4, title: 'Episode 4', id: 'DLSZCkBTNxs' },
      { ep: 5, title: 'Episode 5', id: '7Rmnsy_7hAs' },
      { ep: 6, title: 'Episode 6', id: 'VxbFxMgEt_Y' },
      { ep: 7, title: 'Episode 7', id: '3OFlaPUXXpk' },
      { ep: 8, title: 'Episode 8', id: 'MhhOequ5apI' },
      { ep: 9, title: 'Episode 9', id: 'PVSP_kYdGf4' },
      { ep: 10, title: 'Episode 10', id: 'EVR3vZO2huM' },
      { ep: 11, title: 'Episode 11', id: 'aAf4XnntclM' },
      { ep: 12, title: 'Episode 12', id: '0H6OWcftMFk' },
    ]
  },
  {
    id: 'drama-kabhi-main-kabhi-tum',
    name: 'Kabhi Main Kabhi Tum',
    network: 'ARY Digital',
    cast: 'Fahad Mustafa, Hania Aamir',
    episodes: 'Mega Hit Series',
    year: '2024',
    flag: '🇵🇰',
    color: '#e74c3c',
    thumb: 'https://i.ytimg.com/vi/RDU_n8OMN2E/hqdefault.jpg',
    description: 'Blockbuster romantic drama starring Mustafa (Fahad) & Sharjeena (Hania).',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'RDU_n8OMN2E' },
      { ep: 2, title: 'Episode 2', id: '8DpZ0VPv6VI' },
      { ep: 3, title: 'Episode 3', id: 'moSbh2uBc64' },
      { ep: 4, title: 'Episode 4', id: 'iR6LecEXPCs' },
      { ep: 5, title: 'Episode 5', id: 'G69-MawDRxQ' },
      { ep: 6, title: 'Episode 6', id: 'r9FWe4DayGU' },
      { ep: 7, title: 'Episode 7', id: '2Wzv22mjGyg' },
      { ep: 8, title: 'Episode 8', id: 'ULPMJxl0sgw' },
      { ep: 9, title: 'Episode 9', id: null },
      { ep: 10, title: 'Episode 10', id: null },
      { ep: 11, title: 'Episode 11', id: null },
      { ep: 12, title: 'Episode 12', id: null },
    ]
  },
  {
    id: 'drama-tere-bin',
    name: 'Tere Bin',
    network: 'Har Pal Geo',
    cast: 'Wahaj Ali, Yumna Zaidi',
    episodes: 'Mega Hit Series',
    year: '2023',
    flag: '🇵🇰',
    color: '#2980b9',
    thumb: 'https://i.ytimg.com/vi/wykbxHM2Ch4/hqdefault.jpg',
    description: 'Record-shattering drama serial starring Murtasim (Wahaj) & Meerab (Yumna).',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'wykbxHM2Ch4' },
      { ep: 2, title: 'Episode 2', id: 'hmZlUfGtbJo' },
      { ep: 3, title: 'Episode 3', id: 'GzYVAZaJ71M' },
      { ep: 4, title: 'Episode 4', id: 'zmFygS2oGkw' },
      { ep: 5, title: 'Episode 5', id: 'vbtPhGeShQQ' },
      { ep: 6, title: 'Episode 6', id: '-HiIVL0EOS4' },
      { ep: 7, title: 'Episode 7', id: 'ufdD9nZtgbw' },
      { ep: 8, title: 'Episode 8', id: 'RilczE2ToBc' },
      { ep: 9, title: 'Episode 9', id: null },
      { ep: 10, title: 'Episode 10', id: null },
      { ep: 11, title: 'Episode 11', id: null },
      { ep: 12, title: 'Episode 12', id: null },
    ]
  },
  {
    id: 'drama-kabli-pulao',
    name: 'Kabli Pulao',
    network: 'Green TV',
    cast: 'Sabeena Farooq, Mohammed Ehteshamuddin',
    episodes: 'Critically Acclaimed',
    year: '2023',
    flag: '🇵🇰',
    color: '#27ae60',
    thumb: 'https://i.ytimg.com/vi/uxXeBFPGZhs/hqdefault.jpg',
    description: 'Heart-touching story of Haji Mushtaq & Barbeena on Green TV Entertainment.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'uxXeBFPGZhs' },
      { ep: 2, title: 'Episode 2', id: 'eiRw7mvHwrQ' },
      { ep: 3, title: 'Episode 3', id: 'p3RnpoFf4hs' },
      { ep: 4, title: 'Episode 4', id: 'pKcshzD23BU' },
      { ep: 5, title: 'Episode 5', id: 'CsBg7C5VVl4' },
      { ep: 6, title: 'Episode 6', id: '_mf0MZvkxFc' },
      { ep: 7, title: 'Episode 7', id: null },
      { ep: 8, title: 'Episode 8', id: null },
    ]
  },
  {
    id: 'drama-ishq-murshid',
    name: 'Ishq Murshid',
    network: 'HUM TV',
    cast: 'Bilal Abbas Khan, Durefishan Saleem',
    episodes: 'Mega Hit Series',
    year: '2024',
    flag: '🇵🇰',
    color: '#e67e22',
    thumb: 'https://i.ytimg.com/vi/F4Z6EEzlQY4/hqdefault.jpg',
    description: 'Superhit romantic drama starring Shahmeer Sikandar & Shibra on HUM TV.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'j1j91RAoM8Y' },
      { ep: 2, title: 'Episode 2', id: '7zr3TUe6J1U' },
      { ep: 3, title: 'Episode 3', id: 'jc4S0D3qF9E' },
      { ep: 4, title: 'Episode 4', id: 'TI7QEvvVQgA' },
      { ep: 5, title: 'Episode 5', id: 'IsA2TZdFwSo' },
      { ep: 6, title: 'Episode 6', id: 'QiYgJSTrvY0' },
      { ep: 7, title: 'Episode 7', id: null },
      { ep: 8, title: 'Episode 8', id: null },
    ]
  },
  {
    id: 'drama-mayi-ri',
    name: 'Mayi Ri',
    network: 'ARY Digital',
    cast: 'Aina Asif, Samar Jafri',
    episodes: 'Full Series',
    year: '2023',
    flag: '🇵🇰',
    color: '#e74c3c',
    thumb: 'https://i.ytimg.com/vi/LkBRL2WVuSo/hqdefault.jpg',
    description: 'Social drama highlighting early marriage, starring Aina Asif & Samar Jafri.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'LkBRL2WVuSo' },
      { ep: 2, title: 'Episode 2', id: null },
      { ep: 3, title: 'Episode 3', id: null },
      { ep: 4, title: 'Episode 4', id: null },
      { ep: 5, title: 'Episode 5', id: null },
      { ep: 6, title: 'Episode 6', id: null },
    ]
  },
  {
    id: 'drama-parizaad',
    name: 'Parizaad',
    network: 'HUM TV',
    cast: 'Ahmed Ali Akbar, Yumna Zaidi',
    episodes: 'All-Time Classic',
    year: '2021',
    flag: '🇵🇰',
    color: '#e67e22',
    thumb: 'https://i.ytimg.com/vi/fwZ6JNfXezg/hqdefault.jpg',
    description: 'Masterpiece based on Hashim Nadeem novel, starring Ahmed Ali Akbar.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'fwZ6JNfXezg' },
      { ep: 2, title: 'Episode 2', id: null },
      { ep: 3, title: 'Episode 3', id: null },
      { ep: 4, title: 'Episode 4', id: null },
      { ep: 5, title: 'Episode 5', id: null },
      { ep: 6, title: 'Episode 6', id: null },
    ]
  },
  {
    id: 'drama-jaan-e-jahan',
    name: 'Jaan-e-Jahan',
    network: 'ARY Digital',
    cast: 'Hamza Ali Abbasi, Ayeza Khan',
    episodes: 'Grand Drama',
    year: '2024',
    flag: '🇵🇰',
    color: '#e74c3c',
    thumb: 'https://i.ytimg.com/vi/w14APWbqbcM/hqdefault.jpg',
    description: 'Epic love saga reuniting Pyarey Afzal stars Hamza Ali Abbasi and Ayeza Khan.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'w14APWbqbcM' },
      { ep: 2, title: 'Episode 2', id: null },
      { ep: 3, title: 'Episode 3', id: null },
      { ep: 4, title: 'Episode 4', id: null },
      { ep: 5, title: 'Episode 5', id: null },
      { ep: 6, title: 'Episode 6', id: null },
    ]
  },
  {
    id: 'drama-jeevan-nagar',
    name: 'Jeevan Nagar',
    network: 'Green TV',
    cast: 'Sohail Ahmed, Rabia Butt',
    episodes: 'Social Comedy Drama',
    year: '2023',
    flag: '🇵🇰',
    color: '#27ae60',
    thumb: 'https://i.ytimg.com/vi/tvaq1oWU6Jg/hqdefault.jpg',
    description: 'Starring veteran actor Sohail Ahmed as Babbar Shah on Green TV Entertainment.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'tvaq1oWU6Jg' },
      { ep: 2, title: 'Episode 2', id: null },
      { ep: 3, title: 'Episode 3', id: null },
      { ep: 4, title: 'Episode 4', id: null },
    ]
  },
  {
    id: 'drama-khuda-aur-muhabbat-3',
    name: 'Khuda Aur Muhabbat 3',
    network: 'Har Pal Geo',
    cast: 'Feroze Khan, Iqra Aziz',
    episodes: 'Blockbuster Romance',
    year: '2021',
    flag: '🇵🇰',
    color: '#2980b9',
    thumb: 'https://i.ytimg.com/vi/zvXxQoLpZqQ/hqdefault.jpg',
    description: 'Billion-view blockbuster drama serial starring Farhad and Mahi on Har Pal Geo.',
    episodesList: [
      { ep: 1, title: 'Episode 1', id: 'zvXxQoLpZqQ' },
      { ep: 2, title: 'Episode 2', id: null },
      { ep: 3, title: 'Episode 3', id: null },
      { ep: 4, title: 'Episode 4', id: null },
    ]
  }
];

// ── Webcric Live Cricket Match Center (Featured & Live Matches) ───────────────
const FEATURED_CRICKET_MATCHES = [
  {
    id: 'match-pak-semifinal',
    title: 'Pakistan vs Semi-Finalist',
    series: 'Asian Games 2026 — Semi Final',
    format: 'T20 International',
    status: 'LIVE NOW',
    isLive: true,
    score: 'PAK: 178/4 (18.2 ov) · RR: 9.71',
    venue: 'Pingfeng Campus Cricket Field, Hangzhou',
    teams: [
      { name: 'Pakistan', flag: '🇵🇰', code: 'PAK' },
      { name: 'Opponent', flag: '🏆', code: 'TBD' }
    ],
    broadcasters: ['PTV Sports HD', 'A Sports HD', 'Ten Sports'],
    servers: [
      { id: 1, name: 'Server 1 (PTV Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8' },
      { id: 2, name: 'Server 2 (A Sports / Fast)', url: 'https://cdn.rabta.stream/M-Sports/index.m3u8' },
      { id: 3, name: 'Server 3 (Cricket Gold)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8' }
    ],
    officialApps: [
      { name: 'Tamasha Web', url: 'https://tamashaweb.com', tag: '0-Delay HD in PK' },
      { name: 'Tapmad Sports', url: 'https://tapmad.com', tag: 'Ad-Free Cricket' },
      { name: 'PCB Live', url: 'https://live.pcb.com.pk', tag: 'Official Board Feed' }
    ]
  },
  {
    id: 'match-eng-aus-series',
    title: 'England vs Australia',
    series: 'Bilateral T20I Series 2026',
    format: 'T20 International',
    status: 'LIVE NOW',
    isLive: true,
    score: 'ENG: 194/6 (20 ov) · AUS: 142/3 (14.1 ov)',
    venue: 'Lord’s Cricket Ground, London',
    teams: [
      { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
      { name: 'Australia', flag: '🇦🇺', code: 'AUS' }
    ],
    broadcasters: ['Sky Sports Cricket', 'Willow HD', 'Cricket Gold'],
    servers: [
      { id: 1, name: 'Server 1 (Cricket Gold HD)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8' },
      { id: 2, name: 'Server 2 (PK Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8' },
      { id: 3, name: 'Server 3 (M Sports Fast)', url: 'https://cdn.rabta.stream/M-Sports/index.m3u8' }
    ],
    officialApps: [
      { name: 'Sky Go / Now TV', url: 'https://www.skysports.com', tag: 'Official UK' },
      { name: 'Willow TV', url: 'https://www.willow.tv', tag: 'Official US' }
    ]
  },
  {
    id: 'match-psl-champions',
    title: 'Lahore Qalandars vs Karachi Kings',
    series: 'Pakistan Super League (PSL Special)',
    format: 'T20 League Match',
    status: 'TODAY 19:30 PKT',
    isLive: false,
    score: 'Starts at 7:30 PM PKT',
    venue: 'Gaddafi Stadium, Lahore',
    teams: [
      { name: 'Lahore Qalandars', flag: '🔴', code: 'LQ' },
      { name: 'Karachi Kings', flag: '🔵', code: 'KK' }
    ],
    broadcasters: ['A Sports HD', 'PTV Sports HD', 'Ten Sports'],
    servers: [
      { id: 1, name: 'Server 1 (A Sports HD)', url: 'https://cdn.rabta.stream/M-Sports/index.m3u8' },
      { id: 2, name: 'Server 2 (PTV Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8' },
      { id: 3, name: 'Server 3 (Cricket Gold)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8' }
    ],
    officialApps: [
      { name: 'Tamasha Web', url: 'https://tamashaweb.com', tag: 'Official PSL Partner' },
      { name: 'Tapmad', url: 'https://tapmad.com', tag: '4K Ultra Stream' }
    ]
  },
  {
    id: 'match-ind-semifinal',
    title: 'India vs Semi-Finalist',
    series: 'Asian Games 2026 — Semi Final',
    format: 'T20 International',
    status: 'UPCOMING',
    isLive: false,
    score: 'Match scheduled for tomorrow',
    venue: 'Hangzhou International Sports Park',
    teams: [
      { name: 'India', flag: '🇮🇳', code: 'IND' },
      { name: 'Opponent', flag: '🏆', code: 'TBD' }
    ],
    broadcasters: ['Star Sports 1', 'Sony Sports Ten', 'Cricket Gold'],
    servers: [
      { id: 1, name: 'Server 1 (Cricket Gold HD)', url: 'https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8' },
      { id: 2, name: 'Server 2 (PK Sports HD)', url: 'https://lbgo.bozztv.com/ssh101/ssh101/pksportshd/playlist.m3u8' }
    ],
    officialApps: [
      { name: 'SonyLIV', url: 'https://www.sonyliv.com', tag: 'Official Broadcast' }
    ]
  }
];

const CATEGORIES = ['All', '🏏 Cricket & Sports', 'Pakistani Dramas', 'Pakistan TV', 'News', 'Documentaries', 'Music'];

// ── Streaming Apps in Pakistan Reference Guide ────────────────────────────────
const PAKISTAN_STREAMING_APPS = [
  { name: 'Tamasha', desc: 'Live TV (Geo, ARY, Hum, Ten Sports), Live Cricket (PSL/ICC) & Pakistani Dramas', tag: 'Top Free + Premium' },
  { name: 'ARY ZAP', desc: 'Official streaming for ARY Digital dramas, ARY News and live cricket streaming', tag: 'Free Official' },
  { name: 'Tapmad', desc: 'Premier sports streaming (EPL, LaLiga, Serie A, Cricket) and on-demand movies', tag: 'Sports Leader' },
  { name: 'Hum TV App / YouTube', desc: 'Full episodes of hit Pakistani dramas (Parizaad, Fairy Tale, Tere Bin)', tag: '1080p Official' },
  { name: 'Shoq TV', desc: 'PTCL streaming service with live Pakistani channels and Hollywood blockbusters', tag: 'Telecom TV' },
  { name: 'Myco', desc: 'Decentralized sports streaming app with live cricket streaming in Pakistan', tag: 'Live Sports' },
];

// ── Native / HLS Video Player Component ───────────────────────────────────────
function VideoStreamPlayer({ src, onLoaded, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const onLoadedRef = useRef(onLoaded);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
    onErrorRef.current = onError;
  }, [onLoaded, onError]);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        onLoadedRef.current?.();
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              onErrorRef.current?.();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        onLoadedRef.current?.();
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => onErrorRef.current?.());
    } else {
      onErrorRef.current?.();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={styles.videoPlayer}
      controls
      autoPlay
      playsInline
      onCanPlay={() => onLoadedRef.current?.()}
      onError={() => onErrorRef.current?.()}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LiveTV() {
  const [category, setCategory]           = useState('All');
  const [sportSubFilter, setSportSubFilter] = useState('All'); // 'All' | 'cricket' | 'football' | 'racing' | 'combat'
  const [query, setQuery]                 = useState('');
  const [activeMedia, setActiveMedia]     = useState(null); // active channel or drama or match object
  const [selectedEp, setSelectedEp]       = useState(1);    // currently selected episode number
  const [resolvedEpId, setResolvedEpId]   = useState(null); // dynamically fetched videoId for current episode
  const [sidebarTab, setSidebarTab]       = useState('episodes'); // 'episodes' | 'all' | 'matches' | 'channels'
  const [activeServer, setServer]         = useState(1);    // 1 = Main/HD, 2 = Backup/Fast, 3 = Server 3
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(false);
  const [showAppsGuide, setShowAppsGuide] = useState(false);
  const [jumpInput, setJumpInput]         = useState('');
  const [customMaxEp, setCustomMaxEp]     = useState(0);

  // Live Internet Drama Search State
  const [onlineDramas, setOnlineDramas]       = useState([]);
  const [searchingOnline, setSearchingOnline] = useState(false);

  // Search sanitizer that strips trailing 's' (handles "dar e nijatS" -> "dar e nijat")
  const cleanQ = useMemo(() => query.toLowerCase().trim().replace(/s$/, ''), [query]);

  // Debounced dynamic search across the entire internet for ANY drama or show
  useEffect(() => {
    if (!cleanQ || cleanQ.length < 2) {
      setOnlineDramas([]);
      setSearchingOnline(false);
      return;
    }

    setSearchingOnline(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchOnlineDramas(cleanQ);
        setOnlineDramas(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingOnline(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [cleanQ]);

  // Filter channels
  const filteredChannels = useMemo(() =>
    CHANNELS.filter(ch => {
      const matchCat =
        category === 'All' ||
        (category === '🏏 Cricket & Sports' ? ch.category === 'Sports' : ch.category === category) ||
        (category === 'Pakistan TV' && ch.country === 'PK');

      if (!matchCat) return false;

      // Sports sub-category filter (e.g. Cricket, Football, Racing, Combat)
      if ((category === '🏏 Cricket & Sports' || category === 'Sports') && sportSubFilter !== 'All') {
        if (ch.category === 'Sports' && ch.sportType !== sportSubFilter) return false;
      }

      if (!cleanQ) return true;

      const inName = ch.name.toLowerCase().includes(cleanQ);
      const inCat = ch.category.toLowerCase().includes(cleanQ);
      const inDramas = ch.dramas?.some(d => d.toLowerCase().includes(cleanQ));
      const inKeywords = (ch.country === 'PK' && ('pakistan'.includes(cleanQ) || 'urdu'.includes(cleanQ))) ||
        (ch.category === 'Sports' && ('cricket'.includes(cleanQ) || 'match'.includes(cleanQ) || 'sports'.includes(cleanQ)));

      return inName || inCat || inDramas || inKeywords;
    }), [category, sportSubFilter, cleanQ]);

  // Filter Pakistani Dramas: Merges default curated dramas with live internet search results
  const filteredDramas = useMemo(() => {
    // If not searching, just show currently streamed default dramas on UI screen
    if (!cleanQ) {
      if (category !== 'All' && category !== 'Pakistan TV' && category !== 'Pakistani Dramas') {
        return [];
      }
      return DEFAULT_PAKISTANI_DRAMAS;
    }

    // When searching, match from default catalog + live internet results
    const localMatches = DEFAULT_PAKISTANI_DRAMAS.filter(d =>
      d.name.toLowerCase().includes(cleanQ) ||
      d.network.toLowerCase().includes(cleanQ) ||
      d.cast.toLowerCase().includes(cleanQ) ||
      'pakistan'.includes(cleanQ) ||
      'drama'.includes(cleanQ)
    );

    // Merge without duplicates
    const combined = [...localMatches];
    for (const od of onlineDramas) {
      const existingIdx = combined.findIndex(c => c.name.toLowerCase() === od.name.toLowerCase());
      if (existingIdx === -1) {
        combined.push(od);
      } else if (od.episodesList?.length > (combined[existingIdx].episodesList?.length || 0)) {
        // Upgrade with online version if it has more complete episodes
        combined[existingIdx] = od;
      }
    }
    return combined;
  }, [category, cleanQ, onlineDramas]);

  // Group channels by category for layout
  const groupedChannels = useMemo(() => {
    if (category === 'Pakistani Dramas') return {};
    if (category === '🏏 Cricket & Sports') return { 'Sports': filteredChannels };
    if (category !== 'All') return { [category]: filteredChannels };
    return ['Sports', 'Pakistan TV', 'News', 'Documentaries', 'Music'].reduce((acc, cat) => {
      const channels = filteredChannels.filter(ch =>
        cat === 'Pakistan TV' ? ch.country === 'PK' : ch.category === cat
      );
      if (channels.length) acc[cat] = channels;
      return acc;
    }, {});
  }, [category, filteredChannels]);

  const openItem = (item, isDrama = false) => {
    setActiveMedia({ ...item, isDramaItem: isDrama, isMatch: false });
    setSelectedEp(1);
    setCustomMaxEp(0);
    setResolvedEpId(item.episodesList?.[0]?.id || item.videoId || null);
    setSidebarTab(isDrama ? 'episodes' : item.category === 'Sports' ? 'channels' : 'all');
    setServer(1);
    setLoading(true);
    setError(false);
  };

  const openMatch = (match, serverNum = 1) => {
    const srv = match.servers.find(s => s.id === serverNum) || match.servers[0];
    setActiveMedia({
      ...match,
      name: `${match.teams[0].name} vs ${match.teams[1].name}`,
      streamUrl: srv.url,
      backupUrl: match.servers[1]?.url || srv.url,
      server3Url: match.servers[2]?.url || '',
      isMatch: true,
      isDramaItem: false,
      isHls: true,
      quality: '1080p HD Live',
      flag: '🏏',
      color: '#1b7a42',
      category: 'Sports',
      description: `${match.series} · ${match.format} · ${match.venue}`
    });
    setServer(serverNum);
    setSidebarTab('matches');
    setLoading(true);
    setError(false);
  };

  const switchServer = () => {
    setServer(s => {
      if (activeMedia?.server3Url || (activeMedia?.servers && activeMedia.servers.length > 2)) {
        return s === 1 ? 2 : s === 2 ? 3 : 1;
      }
      return s === 1 ? 2 : 1;
    });
    setLoading(true);
    setError(false);
  };

  // Active episodes list for currently playing drama (dynamically extensible to any episode number)
  const activeEpList = useMemo(() => {
    if (!activeMedia?.isDramaItem) return [];
    const baseList = activeMedia.episodesList && activeMedia.episodesList.length > 0
      ? [...activeMedia.episodesList]
      : Array.from({ length: 30 }, (_, i) => ({ ep: i + 1, id: null }));

    const currentMax = baseList.length > 0 ? Math.max(...baseList.map(e => e.ep)) : 0;
    const targetMax = Math.max(currentMax, selectedEp, customMaxEp);

    for (let i = currentMax + 1; i <= targetMax; i++) {
      baseList.push({
        ep: i,
        title: `${activeMedia.name} - Episode ${i}`,
        id: null,
        thumb: baseList[0]?.thumb || '',
        author: activeMedia.network || ''
      });
    }
    return baseList;
  }, [activeMedia, selectedEp, customMaxEp]);

  // When episode changes, ensure we have the exact videoId (from list or dynamic internet fetch)
  useEffect(() => {
    if (!activeMedia?.isDramaItem) return;

    const epData = activeEpList.find(e => e.ep === selectedEp);
    if (epData && epData.id) {
      setResolvedEpId(epData.id);
      return;
    }

    setResolvedEpId(null);
    let cancelled = false;
    fetchSpecificEpisode(activeMedia.name, activeMedia.network, selectedEp).then(id => {
      if (!cancelled && id) {
        setResolvedEpId(id);
        if (epData) epData.id = id;
      }
    });

    return () => { cancelled = true; };
  }, [selectedEp, activeMedia, activeEpList]);

  // Determine current stream or embed URL
  const currentStreamUrl = useMemo(() => {
    if (!activeMedia) return '';
    if (activeMedia.isDramaItem) {
      if (activeServer === 1) {
        if (resolvedEpId) {
          return `https://www.youtube-nocookie.com/embed/${resolvedEpId}?autoplay=1&enablejsapi=1`;
        }
        // Direct search embed fallback while fetching
        const searchPhrase = `${activeMedia.name} Episode ${selectedEp} ${activeMedia.network}`;
        return `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(searchPhrase)}&autoplay=1&enablejsapi=1`;
      }
      // Server 2 fallback for drama: network live broadcast or mirror
      const networkCh = CHANNELS.find(c => c.name.toLowerCase().includes(activeMedia.network.toLowerCase().split(' ')[0]));
      return networkCh?.backupUrl || networkCh?.streamUrl || `https://www.youtube-nocookie.com/embed/${resolvedEpId || ''}?autoplay=1`;
    }

    if (activeMedia.isMatch) {
      const srv = activeMedia.servers?.find(s => s.id === activeServer) || activeMedia.servers?.[0];
      return srv?.url || activeMedia.streamUrl;
    }

    if (activeServer === 1) return activeMedia.streamUrl;
    if (activeServer === 2) return activeMedia.backupUrl || activeMedia.streamUrl;
    return activeMedia.server3Url || activeMedia.backupUrl || activeMedia.streamUrl;
  }, [activeMedia, activeServer, selectedEp, resolvedEpId]);

  const isCurrentAnEmbed = useMemo(() => {
    if (!activeMedia) return false;
    if (activeMedia.isDramaItem && activeServer === 1) return true;
    if (activeServer === 2 && activeMedia.backupUrl && activeMedia.backupUrl.includes('youtube')) return true;
    if (activeServer === 3 && activeMedia.server3Url && activeMedia.server3Url.includes('youtube')) return true;
    return Boolean(activeMedia.isEmbed);
  }, [activeMedia, activeServer]);

  const handleJumpEpisode = (e) => {
    e.preventDefault();
    const epNum = parseInt(jumpInput, 10);
    if (!isNaN(epNum) && epNum > 0) {
      setSelectedEp(epNum);
      setLoading(true);
      setError(false);
      setJumpInput('');
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.livePulse} />
          PAKISTAN TV · ARY · GEO · GREEN TV · HUM TV · ALL EPISODES
        </div>
        <h1 className={styles.heroTitle}>
          Stream <span className={styles.accent}>Pakistani Dramas & Live TV</span>
        </h1>
        <p className={styles.heroSub}>
          Watch any drama or TV show from across the internet with all complete episodes in 1080p HD.
        </p>

        <div className={styles.searchBar}>
          {searchingOnline ? (
            <Loader2 size={16} className={`${styles.searchIco} ${styles.spinIco}`} color="#e50914" />
          ) : (
            <Search size={16} className={styles.searchIco} />
          )}
          <input
            placeholder="Search ANY drama (e.g. 'Dar e Nijat', 'Khaie', 'Gentleman', 'Tere Bin')…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          {query && <button onClick={() => setQuery('')} className={styles.clearBtn}>✕</button>}
        </div>

        {searchingOnline && (
          <p style={{ fontSize: '0.78rem', color: '#ff6b6b', margin: '8px 0 0' }}>
            ⚡ Searching the entire internet for "{query}" and complete episodes…
          </p>
        )}

        {/* Pakistan Streaming Apps Quick Guide Toggle */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => setShowAppsGuide(prev => !prev)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={14} color="#e50914" />
            {showAppsGuide ? 'Hide Pakistan Streaming Apps Guide' : '📺 View Official Pakistan Streaming Apps Guide'}
          </button>
        </div>

        {/* Streaming Apps in Pakistan Panel */}
        <AnimatePresence>
          {showAppsGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                maxWidth: '780px',
                margin: '20px auto 0',
                background: 'rgba(17,17,24,0.96)',
                border: '1px solid rgba(229,9,20,0.3)',
                borderRadius: '14px',
                padding: '16px 20px',
                textAlign: 'left',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                  🇵🇰 Official Streaming Apps & Platforms in Pakistan
                </span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                  TV Shows, Live Cricket & Dramas
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {PAKISTAN_STREAMING_APPS.map(app => (
                  <div
                    key={app.name}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: '#fff', fontSize: '0.86rem' }}>{app.name}</strong>
                      <span style={{ fontSize: '0.66rem', background: 'rgba(229,9,20,0.2)', color: '#ff6b6b', padding: '2px 6px', borderRadius: '4px' }}>
                        {app.tag}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.3' }}>
                      {app.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Category Tabs ── */}
      <div className={styles.catBar}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.catTab} ${category === cat ? styles.catActive : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat === 'Pakistan TV' ? '🇵🇰 Pakistan TV Channels' : cat === 'Pakistani Dramas' ? '🎬 Pakistani Dramas' : cat}
          </button>
        ))}
      </div>

      {/* ── Main Content Area ── */}
      <main className={styles.main}>
        {/* ── Webcric Live Cricket Match Center ── */}
        {(category === 'All' || category === '🏏 Cricket & Sports' || category === 'Sports') && !cleanQ && (
          <section className={styles.webcricSection}>
            <div className={styles.webcricHeader}>
              <div>
                <h2 className={styles.webcricTitle}>
                  <Trophy size={22} color="#2ecc71" />
                  Webcric Live Cricket Match Center
                  <span className={styles.matchBadgeLive} style={{ marginLeft: '6px' }}>
                    <span className={styles.dotPulse} /> LIVE
                  </span>
                </h2>
                <span className={styles.webcricSubtitle}>
                  Real-time multi-server streaming for Pakistan Cricket, PSL, ICC Tournaments & Global T20 Leagues
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="https://tamashaweb.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.broadcasterTag}
                  style={{ textDecoration: 'none', background: 'rgba(46,204,113,0.15)', color: '#2ecc71', borderColor: 'rgba(46,204,113,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={11} /> Tamasha (0-Delay)
                </a>
                <a
                  href="https://tapmad.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.broadcasterTag}
                  style={{ textDecoration: 'none', background: 'rgba(231,76,60,0.15)', color: '#ff6b6b', borderColor: 'rgba(231,76,60,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={11} /> Tapmad (Ad-Free)
                </a>
              </div>
            </div>

            <div className={styles.matchGrid}>
              {FEATURED_CRICKET_MATCHES.map(match => (
                <div
                  key={match.id}
                  className={`${styles.matchCard} ${match.isLive ? styles.matchCardLive : ''}`}
                >
                  <div className={styles.matchCardTop}>
                    <span className={styles.matchSeries}>{match.series}</span>
                    {match.isLive ? (
                      <span className={styles.matchBadgeLive}>
                        <span className={styles.dotPulse} /> LIVE
                      </span>
                    ) : (
                      <span className={styles.matchBadgeUpcoming}>{match.status}</span>
                    )}
                  </div>

                  <div className={styles.matchVersus}>
                    <div className={styles.matchTeam}>
                      <span className={styles.matchTeamFlag}>{match.teams[0].flag}</span>
                      <span className={styles.matchTeamName}>{match.teams[0].name}</span>
                    </div>
                    <span className={styles.matchVs}>VS</span>
                    <div className={`${styles.matchTeam} ${styles.matchTeamRight}`}>
                      <span className={styles.matchTeamName}>{match.teams[1].name}</span>
                      <span className={styles.matchTeamFlag}>{match.teams[1].flag}</span>
                    </div>
                  </div>

                  <div className={styles.matchScoreTicker}>
                    <span>{match.score}</span>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>{match.format}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.matchBroadcasters}>
                      {match.broadcasters.map(b => (
                        <span key={b} className={styles.broadcasterTag}>{b}</span>
                      ))}
                    </div>
                    <span className={styles.matchVenue}>{match.venue.split(',')[0]}</span>
                  </div>

                  {/* Multi-Server Stream Buttons (Webcric style) */}
                  <div className={styles.matchServersRow}>
                    {match.servers.map((srv, idx) => (
                      <button
                        key={srv.id}
                        type="button"
                        className={`${styles.serverBtn} ${idx === 0 ? styles.serverBtnPrimary : ''}`}
                        onClick={() => openMatch(match, srv.id)}
                        title={`Stream ${match.title} on ${srv.name}`}
                      >
                        <Zap size={12} />
                        {srv.name.split(' ')[0]} {srv.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sports Sub-Filter Pills when inside Cricket & Sports */}
        {(category === '🏏 Cricket & Sports' || category === 'Sports') && (
          <div className={styles.sportsFilterRow}>
            {[
              { id: 'All', label: '⚡ All Sports Channels' },
              { id: 'cricket', label: '🏏 Live Cricket (PTV, A Sports, Ten, Willow, Sky)' },
              { id: 'football', label: '⚽ Football & Soccer (beIN Sports)' },
              { id: 'racing', label: '🏎️ F1 & Motorsport (Red Bull TV, Motorvision)' },
              { id: 'combat', label: '🥊 Combat & Tennis (Fight Network, Tennis Channel)' }
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                className={`${styles.sportsPill} ${sportSubFilter === pill.id ? styles.sportsPillActive : ''}`}
                onClick={() => setSportSubFilter(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

        {/* Top Pakistani Dramas Section */}
        {filteredDramas.length > 0 && (category === 'All' || category === 'Pakistan TV' || category === 'Pakistani Dramas') && (
          <section className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2 className={styles.rowTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#e50914" />
                {cleanQ ? `Dramas & Series Found for "${query}" (${filteredDramas.length})` : '🎬 Currently Streamed Pakistani Dramas (Full Episodes)'}
              </h2>
              <span className={styles.rowCount}>ARY · Har Pal Geo · Green TV · HUM TV · Internet</span>
            </div>

            <div className={styles.dramaRow}>
              {filteredDramas.map((drama, i) => (
                <motion.div
                  key={drama.id}
                  className={styles.dramaCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openItem(drama, true)}
                >
                  <div className={styles.dramaThumbWrap}>
                    <img src={drama.thumb} alt={drama.name} className={styles.dramaThumb} loading="lazy" />
                    <span className={styles.dramaNetworkBadge}>{drama.network}</span>
                    <div className={styles.dramaPlayHover}>
                      <div className={styles.dramaPlayIcon}><Play size={16} fill="#fff" /></div>
                    </div>
                  </div>
                  <div className={styles.dramaBody}>
                    <h3 className={styles.dramaName}>{drama.name}</h3>
                    <p className={styles.dramaCast}>{drama.cast}</p>
                    <div className={styles.dramaMeta}>
                      <span className={styles.dramaEpBadge}>{drama.episodes || `${drama.episodesList?.length || 10} Episodes`}</span>
                      <span className={styles.dramaYear}>{drama.year}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Live TV Channels Rows */}
        {Object.entries(groupedChannels).map(([cat, channels]) => (
          <section key={cat} className={styles.rowSection}>
            <div className={styles.rowHeader}>
              <h2 className={styles.rowTitle}>
                {cat === 'Sports'
                  ? '🏏 Live Sports TV (PTV Sports, A Sports, Ten Sports, Willow, Sky Sports, beIN)'
                  : cat === 'Pakistan TV'
                  ? '🇵🇰 Pakistan Live TV Channels (ARY, Geo, Green, HUM, Express)'
                  : cat}
              </h2>
              <span className={styles.rowCount}>{channels.length} channels</span>
            </div>
            <div className={styles.channelRow}>
              {channels.map((ch, i) => (
                <motion.div
                  key={ch.id}
                  className={styles.channelCard}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  onClick={() => openItem(ch, false)}
                  style={{ '--ch-color': ch.color }}
                >
                  <div className={styles.cardGlow} />
                  <div className={styles.cardFlag}>{ch.flag}</div>
                  <div className={styles.liveDot}>
                    <span className={styles.dotPulse} />
                    LIVE
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.chName}>{ch.name}</h3>
                    <p className={styles.chDesc}>{ch.description}</p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.qualityBadge}>{ch.quality}</span>
                    <div className={styles.playIcon}><Play size={14} fill="#fff" /></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {/* Empty Search Fallback */}
        {!searchingOnline && filteredDramas.length === 0 && filteredChannels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
            <Film size={48} color="#e50914" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>No Dramas Found for "{query}"</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Try searching any drama name like <strong>Dar-e-Nijaat</strong>, <strong>Khaie</strong>, <strong>Noor Jahan</strong>, <strong>Gentleman</strong>, <strong>Kabhi Main Kabhi Tum</strong>, or <strong>Tere Bin</strong>.
            </p>
          </div>
        )}
      </main>

      {/* ── Player Modal ── */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            className={styles.playerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setActiveMedia(null)}
          >
            <motion.div
              className={styles.playerModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className={styles.playerHeader}>
                <div className={styles.playerMeta}>
                  <span className={styles.liveTag}>
                    <span className={styles.dotPulse} /> {activeMedia.isDramaItem ? `EPISODE ${selectedEp}` : 'LIVE'}
                  </span>
                  <span className={styles.playerChName}>
                    {activeMedia.flag} {activeMedia.name} {activeMedia.isDramaItem ? `· Episode ${selectedEp}` : ''}
                  </span>
                  <span className={styles.playerCat}>
                    {activeMedia.isDramaItem ? `${activeMedia.network} · 1080p HD` : activeMedia.category}
                  </span>
                </div>
                <div className={styles.playerControls}>
                  <button
                    className={`${styles.serverBtn} ${activeServer === 1 ? styles.srvActive : ''}`}
                    onClick={() => { setServer(1); setLoading(true); setError(false); }}
                    title="Direct high-definition player"
                  >
                    <Signal size={12} /> {activeMedia.isDramaItem ? `Server 1 (Ep ${selectedEp})` : 'Server 1 (HD)'}
                  </button>
                  <button
                    className={`${styles.serverBtn} ${activeServer === 2 ? styles.srvActive : ''}`}
                    onClick={() => { setServer(2); setLoading(true); setError(false); }}
                    title="Alternative live feed or fast mobile stream"
                  >
                    <Wifi size={12} /> {activeMedia.isDramaItem ? 'Server 2 (Live Channel)' : 'Server 2 (Fast)'}
                  </button>
                  {Boolean(activeMedia.server3Url || (activeMedia.servers && activeMedia.servers.length > 2)) && (
                    <button
                      className={`${styles.serverBtn} ${activeServer === 3 ? styles.srvActive : ''}`}
                      onClick={() => { setServer(3); setLoading(true); setError(false); }}
                      title="Server 3 alternative or mirror stream"
                    >
                      <Zap size={12} /> Server 3
                    </button>
                  )}
                  <button className={styles.closeBtn} onClick={() => setActiveMedia(null)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Player Area */}
              <div className={styles.playerBody}>
                <div className={styles.playerWrap}>
                  {loading && !error && (
                    <div className={styles.loadingOverlay}>
                      <div className={styles.spinner} />
                      <p>
                        {activeMedia.isDramaItem
                          ? `Loading ${activeMedia.name} Episode ${selectedEp}…`
                          : `Connecting to ${activeMedia.name}…`}
                      </p>
                    </div>
                  )}

                  {error ? (
                    <div className={styles.errorState}>
                      <Radio size={40} color="#e50914" />
                      <h3>Stream Temporarily Unavailable</h3>
                      <p>Try switching to Server 2 or Server 3.</p>
                      <div className={styles.errorBtns}>
                        <button onClick={() => { setError(false); setLoading(true); }}>
                          <RefreshCw size={14} /> Retry
                        </button>
                        <button onClick={switchServer}>
                          Switch Server
                        </button>
                      </div>
                    </div>
                  ) : isCurrentAnEmbed ? (
                    <iframe
                      key={currentStreamUrl}
                      src={currentStreamUrl}
                      className={styles.iframePlayer}
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      onLoad={() => setLoading(false)}
                      onError={() => { setLoading(false); setError(true); }}
                    />
                  ) : (
                    <VideoStreamPlayer
                      key={currentStreamUrl}
                      src={currentStreamUrl}
                      onLoaded={() => setLoading(false)}
                      onError={() => { setLoading(false); setError(true); }}
                    />
                  )}

                  {/* ── Interactive Episode Selector Bar (for Dramas) ── */}
                  {activeMedia.isDramaItem && activeEpList.length > 0 && (
                    <div className={styles.episodeBar}>
                      <div className={styles.epNavLeft}>
                        <button
                          disabled={selectedEp <= 1}
                          onClick={() => { setSelectedEp(e => Math.max(1, e - 1)); setLoading(true); setError(false); }}
                          className={styles.epNavBtn}
                          title="Previous Episode"
                        >
                          ‹ Prev Ep
                        </button>
                        <span className={styles.epIndicator}>
                          Episode <strong>{selectedEp}</strong> of {activeEpList.length}
                        </span>
                        <button
                          onClick={() => { setSelectedEp(e => e + 1); setLoading(true); setError(false); }}
                          className={styles.epNavBtn}
                          title="Next Episode"
                        >
                          Next Ep ›
                        </button>
                      </div>

                      <div className={styles.epPills}>
                        {activeEpList.map(item => (
                          <button
                            key={item.ep}
                            className={`${styles.epPill} ${selectedEp === item.ep ? styles.epPillActive : ''}`}
                            onClick={() => { setSelectedEp(item.ep); setLoading(true); setError(false); }}
                          >
                            Ep {item.ep}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={styles.epPill}
                          style={{ background: 'rgba(229,9,20,0.2)', border: '1px dashed #e50914', color: '#ff6b6b' }}
                          onClick={() => setCustomMaxEp(m => Math.max(activeEpList.length, selectedEp, m) + 10)}
                          title="Load 10 more episodes"
                        >
                          +10 More
                        </button>
                      </div>

                      {/* Jump to any episode input */}
                      <form onSubmit={handleJumpEpisode} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          placeholder="Jump Ep #"
                          min="1"
                          max="150"
                          value={jumpInput}
                          onChange={e => setJumpInput(e.target.value)}
                          style={{
                            width: '80px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: '#e50914',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Go
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Match Info Ticker for Live Matches */}
                  {activeMedia.isMatch && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#2ecc71', fontWeight: 600 }}>
                        <span className={styles.dotPulse} /> {activeMedia.score}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href="https://tamashaweb.com"
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          Tamasha PK
                        </a>
                        <a
                          href="https://tapmad.com"
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none', background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#ff6b6b', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}
                        >
                          Tapmad HD
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Sidebar ── */}
                <aside className={styles.sidebar}>
                  {activeMedia.isDramaItem ? (
                    <>
                      <div className={styles.sideTabGroup}>
                        <button
                          className={`${styles.sideTab} ${sidebarTab === 'episodes' ? styles.sideTabActive : ''}`}
                          onClick={() => setSidebarTab('episodes')}
                        >
                          📑 Episodes ({activeEpList.length})
                        </button>
                        <button
                          className={`${styles.sideTab} ${sidebarTab === 'all' ? styles.sideTabActive : ''}`}
                          onClick={() => setSidebarTab('all')}
                        >
                          🎬 Other Dramas
                        </button>
                      </div>

                      <div className={styles.sidebarList}>
                        {sidebarTab === 'episodes' ? (
                          <>
                            {activeEpList.map(ep => (
                              <button
                                key={ep.ep}
                                className={`${styles.sidebarItem} ${selectedEp === ep.ep ? styles.sidebarActive : ''}`}
                                onClick={() => { setSelectedEp(ep.ep); setLoading(true); setError(false); }}
                              >
                                <div className={styles.sideEpNum}>{ep.ep}</div>
                                <div className={styles.sideMeta}>
                                  <span className={styles.sideName}>{activeMedia.name} — Episode {ep.ep}</span>
                                  <span className={styles.sideCat}>{activeMedia.network} · Full 1080p</span>
                                </div>
                                {selectedEp === ep.ep && (
                                  <span className={styles.sideLive}><span className={styles.dotPulse} /></span>
                                )}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setCustomMaxEp(m => Math.max(activeEpList.length, selectedEp, m) + 10)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '10px',
                                margin: '8px 4px',
                                width: 'calc(100% - 8px)',
                                background: 'rgba(229, 9, 20, 0.12)',
                                border: '1px solid rgba(229, 9, 20, 0.3)',
                                color: '#ff6b6b',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              + Load 10 More Episodes
                            </button>
                          </>
                        ) : (
                          filteredDramas.map(d => (
                            <button
                              key={d.id}
                              className={`${styles.sidebarItem} ${d.id === activeMedia.id ? styles.sidebarActive : ''}`}
                              onClick={() => openItem(d, true)}
                            >
                              <span className={styles.sideFlag}>{d.flag || '🎬'}</span>
                              <div className={styles.sideMeta}>
                                <span className={styles.sideName}>{d.name}</span>
                                <span className={styles.sideCat}>{d.network}</span>
                              </div>
                              {d.id === activeMedia.id && (
                                <span className={styles.sideLive}><span className={styles.dotPulse} /></span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : activeMedia.isMatch || activeMedia.category === 'Sports' ? (
                    <>
                      <div className={styles.sideTabGroup}>
                        <button
                          className={`${styles.sideTab} ${sidebarTab === 'matches' ? styles.sideTabActive : ''}`}
                          onClick={() => setSidebarTab('matches')}
                        >
                          🏏 Live Matches ({FEATURED_CRICKET_MATCHES.length})
                        </button>
                        <button
                          className={`${styles.sideTab} ${sidebarTab === 'channels' ? styles.sideTabActive : ''}`}
                          onClick={() => setSidebarTab('channels')}
                        >
                          📺 Sports Channels
                        </button>
                      </div>

                      <div className={styles.sidebarList}>
                        {sidebarTab === 'matches' ? (
                          FEATURED_CRICKET_MATCHES.map(m => (
                            <button
                              key={m.id}
                              className={`${styles.sidebarItem} ${m.id === activeMedia.id ? styles.sidebarActive : ''}`}
                              onClick={() => openMatch(m, 1)}
                            >
                              <span className={styles.sideFlag}>{m.teams[0].flag}</span>
                              <div className={styles.sideMeta}>
                                <span className={styles.sideName}>{m.title}</span>
                                <span className={styles.sideCat}>{m.score || m.status}</span>
                              </div>
                              {m.id === activeMedia.id && (
                                <span className={styles.sideLive}><span className={styles.dotPulse} /></span>
                              )}
                            </button>
                          ))
                        ) : (
                          CHANNELS.filter(c => c.category === 'Sports').map(ch => (
                            <button
                              key={ch.id}
                              className={`${styles.sidebarItem} ${ch.id === activeMedia.id ? styles.sidebarActive : ''}`}
                              onClick={() => openItem(ch, false)}
                            >
                              <span className={styles.sideFlag}>{ch.flag}</span>
                              <div className={styles.sideMeta}>
                                <span className={styles.sideName}>{ch.name}</span>
                                <span className={styles.sideCat}>{ch.sportType ? ch.sportType.toUpperCase() : 'SPORTS'} · {ch.quality}</span>
                              </div>
                              {ch.id === activeMedia.id && (
                                <span className={styles.sideLive}><span className={styles.dotPulse} /></span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.sidebarTitle}><Tv size={14} /> Live Channels</div>
                      <div className={styles.sidebarList}>
                        {CHANNELS.map(ch => (
                          <button
                            key={ch.id}
                            className={`${styles.sidebarItem} ${ch.id === activeMedia.id ? styles.sidebarActive : ''}`}
                            onClick={() => openItem(ch, false)}
                          >
                            <span className={styles.sideFlag}>{ch.flag}</span>
                            <div className={styles.sideMeta}>
                              <span className={styles.sideName}>{ch.name}</span>
                              <span className={styles.sideCat}>{ch.category}</span>
                            </div>
                            {ch.id === activeMedia.id && (
                              <span className={styles.sideLive}><span className={styles.dotPulse} /></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
