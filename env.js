/* Tick Tale — which backend this page talks to (loaded first by tick-tale.html and admin.html).
 * The same files are uploaded to production and to UAT; the address in the browser decides:
 *   ticktalewatches.vercel.app      -> production
 *   ticktale-uat.vercel.app         -> UAT (test copy, fake customer data)
 *   localhost / 127.0.0.1           -> production by default (the admin is used locally on the real catalog);
 *                                      open with ?env=uat to switch this browser to UAT, ?env=production to switch back
 *   any other address               -> UAT (fails safe: an unknown host never touches real data)
 * Keys here are the public "anon" keys (protected by the database rules), never service/secret keys.
 */
(function(){
  var ENVS = {
    production: {
      supabaseUrl: 'https://nptdmixxjugnewlanmtg.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdGRtaXh4anVnbmV3bGFubXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTA3ODQsImV4cCI6MjEwNjAyNjc4NH0.3g2Upux4itNx7lV9QxeajudKZyA8DY42RNgE6BYWJwQ',
      waNumber: '201090186280',
      loyaltyUrl: 'https://script.google.com/macros/s/AKfycbwFnSiVENGt84e1VWbf2ap1enHj7H5dyDrAU6P9ziP7ve9OLKCvbutJyde07KtBm-4q9Q/exec'   // owner's Google Apps Script (live loyalty card)
    },
    uat: {
      supabaseUrl: 'https://udtsovhzbaicnccplbmq.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkdHNvdmh6YmFpY25jY3BsYm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5ODQ2NDYsImV4cCI6MjEwOTU2MDY0Nn0.asi6WdC-zwpBoFbuQ50Lq2zHteXnnNJEVEWAYH4b5-g',
      waNumber: '',          // '' = WhatsApp asks which chat to send to, so test orders never land in the business chat
      loyaltyUrl: ''
    }
  };
  var PROD_HOSTS = ['ticktalewatches.vercel.app'];
  var UAT_HOSTS = ['ticktale-uat.vercel.app'];
  var LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', ''];
  var host = location.hostname, name;

  if(PROD_HOSTS.indexOf(host) !== -1) name = 'production';
  else if(UAT_HOSTS.indexOf(host) !== -1) name = 'uat';
  else if(LOCAL_HOSTS.indexOf(host) !== -1){
    var choice = null;
    try{
      var asked = new URLSearchParams(location.search).get('env');
      if(asked === 'uat' || asked === 'production') localStorage.setItem('tt-env', asked);
      choice = localStorage.getItem('tt-env');
    }catch(e){}
    name = choice === 'uat' ? 'uat' : 'production';
  }
  else name = 'uat';

  var env = ENVS[name];
  window.TT_ENV = {
    name: name,
    isLocal: LOCAL_HOSTS.indexOf(host) !== -1,
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    waNumber: env.waNumber,
    loyaltyUrl: env.loyaltyUrl
  };

  if(name === 'uat'){
    // never indexed, always labelled
    var robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    var tag = function(){ if(document.title.indexOf('[UAT]') !== 0) document.title = '[UAT] ' + document.title; };
    document.addEventListener('DOMContentLoaded', tag);   // <title> comes after this script
  }
  var label = name === 'uat' ? 'UAT — بيئة تجارب، مش الموقع الحقيقي' : '';   // production (live or local) shows no strip
  if(label){
    var css = document.createElement('style');
    css.textContent = '.tt-env-banner{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;padding:4px 10px;font:600 12px/1.4 system-ui,Tahoma,sans-serif;' +
      'text-align:center;color:#111;pointer-events:none;letter-spacing:.02em}' +
      '.tt-env-banner.uat{background:#ff9f1a}.tt-env-banner.local{background:#e5484d;color:#fff}';
    document.head.appendChild(css);
    var addBanner = function(){
      var b = document.createElement('div');
      b.className = 'tt-env-banner ' + (name === 'uat' ? 'uat' : 'local');
      b.setAttribute('aria-hidden', 'true'); b.dir = 'rtl'; b.textContent = label;
      document.body.appendChild(b);
    };
    if(document.body) addBanner(); else document.addEventListener('DOMContentLoaded', addBanner);
  }
})();
