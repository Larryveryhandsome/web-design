import contextlib, functools, http.server, json, threading, time
from pathlib import Path
import requests
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'qa';OUT.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks={'desktop':{},'mobile':{},'public':{}}
errors=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1024},device_scale_factor=1)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8765',wait_until='networkidle')
    page.wait_for_function('window.__appReady && window.__photosReady')
    page.screenshot(path=str(OUT/'desktop-top.png'))
    checks['desktop']['property_count']=page.locator('.property').count()
    checks['desktop']['horizontal_overflow']=page.evaluate('document.documentElement.scrollWidth > innerWidth')
    for id in ['Y01','Y02','Y03','M01']:
        page.locator('#'+id).scroll_into_view_if_needed()
        page.wait_for_timeout(150)
    checks['desktop']['loaded_images']=page.locator('.photo-main img').evaluate_all('es=>es.map(e=>({src:e.getAttribute("src"),loaded:e.complete&&e.naturalWidth>0}))')
    page.locator('#Y03').screenshot(path=str(OUT/'y03-card.png'))
    page.locator('#Y03 .photo-main').click()
    checks['desktop']['lightbox_opens']=page.locator('#lightbox').evaluate('e=>e.open')
    page.wait_for_timeout(300)
    page.screenshot(path=str(OUT/'lightbox.png'))
    page.locator('#nextPhoto').click()
    checks['desktop']['gallery_next']='2 /' in page.locator('#lightTitle').inner_text()
    page.locator('#closeLight').click()
    page.locator('[data-region="苗栗"].tab').click()
    checks['desktop']['region_filter']=page.locator('.property:not([hidden])').count()==1
    page.locator('[data-region="all"].tab').click()
    page.locator('#search').fill('YC1842118')
    checks['desktop']['search']=page.locator('.property:not([hidden])').count()==1
    page.locator('#search').fill('')
    page.locator('#Y01 details').evaluate('e=>e.open=true')
    page.locator('#Y01 details').screenshot(path=str(OUT/'details.png'))
    page.locator('#Y01 details').evaluate('e=>e.open=false')
    page.locator('#top').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'desktop-full.png'),full_page=True)
    page.close()
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    mobile.goto('http://127.0.0.1:8765',wait_until='networkidle')
    mobile.wait_for_function('window.__appReady && window.__photosReady')
    checks['mobile']['horizontal_overflow']=mobile.evaluate('document.documentElement.scrollWidth > innerWidth')
    mobile.screenshot(path=str(OUT/'mobile-top.png'))
    for id in ['Y01','Y02','Y03','M01']:
        mobile.locator('#'+id).scroll_into_view_if_needed();mobile.wait_for_timeout(150)
    mobile.locator('#Y03').screenshot(path=str(OUT/'mobile-y03.png'))
    mobile.locator('#top').scroll_into_view_if_needed()
    mobile.screenshot(path=str(OUT/'mobile-full.png'),full_page=True)
    browser.close()
server.shutdown()
checks['javascript_errors']=errors
url='https://larryveryhandsome.github.io/web-design/industrial-factory/'
try:
    r=requests.get(url,timeout=30)
    checks['public']={'url':url,'http_status':r.status_code,'expected_title_present':'苗栗 × 利澤｜工業廠房查核專頁' in r.text,'finalized_hero_present':'Y03 · 宜蘭蘇澳／園區位置待證' in r.text}
except Exception as e:checks['public']={'error':str(e)}
(OUT/'qa-results.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(checks,ensure_ascii=False))
assert not errors,errors
assert not checks['desktop']['horizontal_overflow']
assert not checks['mobile']['horizontal_overflow']
assert checks['desktop']['property_count']==4
assert checks['desktop']['region_filter'] and checks['desktop']['search']
assert checks['desktop']['lightbox_opens'] and checks['desktop']['gallery_next']
assert all(i['loaded'] for i in checks['desktop']['loaded_images'])
