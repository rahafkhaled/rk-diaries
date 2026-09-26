// Front-end preview content. Replace these drafts when real posts are ready.
// Dates are sample publication dates, not dates of the photographed events.
const diaryEntries = [
  {
    slug: 'after-dark', title: 'After dark', category: 'Style', date: '2026-09-26',
    summary: 'Silver, texture, and the details that catch the light.',
    image: 'assets/rahaf-night-out.png', alt: 'Rahaf wearing a silver hijab and rhinestone jeans',
    caption: 'From the camera roll', kicker: 'A closer look',
    paragraphs: ['A silver hijab. Rhinestone denim. A little light catching on everything.', 'Sometimes the details are the whole story. This page starts with a photograph and gives the outfit room to speak.'],
    note: 'Silver / rhinestones / after dark', sample: true
  },
  {
    slug: 'georgia-notes', title: 'Georgia, in the margins', category: 'Places', date: '2026-09-20',
    summary: 'A place I’ve been. A page to come back to.',
    art: 'camera', caption: 'Georgia · travel notes', kicker: 'Somewhere else',
    paragraphs: ['One thing about me: I’ve been to Georgia.', 'For now, a small note in the travel pages. The photographs and the longer story can come later.'],
    note: 'A place, not an itinerary.', sample: true
  },
  {
    slug: 'purple-and-chrome', title: 'Purple & chrome', category: 'Details', date: '2026-08-28',
    summary: 'A visual note on glitter, reflection, and a darker shade of purple.',
    art: 'disco', caption: 'A study in reflection', kicker: 'The detail file',
    paragraphs: ['Deep purple, cool silver, actual glitter. A little early-2000s shine, with the lights turned down.', 'Not every entry needs a big story. Sometimes it’s a colour, a texture, or a few things that look right together.'],
    note: 'Plum / silver / reflected light', sample: true
  }
].sort((a,b)=>b.date.localeCompare(a.date));
const rkeyz = ['@velvetorbit', '@lilacafterhours', '@silverstatic', '@glossindex', '@plumfrequency', '@chromepages', '@midnightmuse', '@violetfilm', '@softflash', '@discodetail', '@satinsignal', '@glittermargin'];
