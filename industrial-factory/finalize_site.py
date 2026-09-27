"""Finalize only this project's files; no private data or other sites are touched."""
import ast,io,json,re,time
from pathlib import Path
import requests
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'photos'
QA=ROOT/'qa'
QA.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'photos.json').read_text())
# Keep only the verified listing image for M01, not 591 promotional graphics.
for x in list(OUT.glob('m01-*')): x.unlink()
murl='https://img1.591.com.tw/house/2026/07/08/178349271800989903.jpg!1000x.water2.jpg'
r=requests.get(murl,timeout=35);r.raise_for_status();im=Image.open(io.BytesIO(r.content));im.load()
(OUT/'m01-1.jpg').write_bytes(r.content)
manifest['M01']['photos']=[{'src':'photos/m01-1.jpg','original':murl,'source':manifest['M01']['source'],'width':im.width,'height':im.height,'caption':'原刊登區域空拍圖；非本案廠房外觀、室內照片或已驗證地籍界址。'}]
# Four Y03 images were visually checked: one building exterior and three road/area views.
y03=manifest['Y03']['photos']
for i,p in enumerate(y03):p['caption']='原刊登建物外觀；仍須承辦確認標的與現況。' if i==3 else '原刊登道路／周邊照片；不是園區或地籍位置證明。'
manifest['Y03']['photos']=y03[3:4]+y03[:3]
# Re-try original source URLs with a normal browser context; never substitute another property.
assign={}
for node in ast.parse((ROOT/'fetch_photos.py').read_text()).body:
    if isinstance(node,ast.Assign):
        for target in node.targets:
            if isinstance(target,ast.Name) and target.id in ('KEY_END','PREFIXES'):
                assign[target.id]=ast.literal_eval(node.value)
checks=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    ctx=browser.new_context(locale='zh-TW',viewport={'width':1440,'height':1000})
    for case in ('Y01','Y02'):
        source=manifest[case]['source']
        page=ctx.new_page()
        try:
            resp=page.goto(source,wait_until='domcontentloaded',timeout=40000)
            page.wait_for_timeout(1500)
            checks.append({'case':case,'page_status':resp.status if resp else None,'title':page.title(),'body_excerpt':page.locator('body').inner_text()[:300]})
            candidates=page.locator('img').evaluate_all("es=>es.map(e=>e.getAttribute('data-src')||e.getAttribute('src')||'').filter(u=>u.includes('yccdn.yungching.com.tw/v1/image/'))")
        except Exception as e:
            checks.append({'case':case,'page_error':str(e)[:150]});candidates=[]
        fallback=['https://yccdn.yungching.com.tw/v1/image/?height=768&key='+p+assign['KEY_END']+'&width=1024' for p in assign['PREFIXES'][case]]
        candidates=list(dict.fromkeys(candidates+fallback))
        photos=[]
        for url in candidates[:8]:
            if len(photos)>=3:break
            try:
                resp=ctx.request.get(url,timeout=25000,headers={'Referer':source})
                body=resp.body()
                checks.append({'case':case,'image_status':resp.status,'bytes':len(body),'content_type':resp.headers.get('content-type'),'error_excerpt':body[:160].decode('utf-8','replace') if resp.status!=200 else ''})
                if resp.status!=200:continue
                im=Image.open(io.BytesIO(body));im.load()
                if im.width<380 or im.height<230:continue
                ext={'JPEG':'jpg','PNG':'png','WEBP':'webp'}.get(im.format,'jpg')
                filename=f'{case.lower()}-{len(photos)+1}.{ext}'
                (OUT/filename).write_bytes(body)
                photos.append({'src':'photos/'+filename,'original':url,'source':source,'width':im.width,'height':im.height,'caption':f'{case} 原刊登照片；非本次現勘與實測。'})
            except Exception as e:checks.append({'case':case,'image_error':str(e)[:150]})
        if photos:manifest[case]['photos']=photos
        else:
            manifest[case]['photos']=[]
            manifest[case]['note']='原站圖片目前無法取得可驗證副本；請由原始刊登相簿查看，不用其他標的照片替代。'
        page.close()
    browser.close()
(ROOT/'photos.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(QA/'image-network-check.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
html=(ROOT/'index.html').read_text()
for a,b in {'达':'達','实':'實','楼':'樓','纳':'納','纯':'純','图':'圖'}.items():html=html.replace(a,b)
# Use a confirmed source image in the cover; do not imply this is Y01.
html=html.replace('Y01 原始刊登照片，非本次現勘','Y03 原刊登建物外觀，標的與現況仍待確認').replace('Y01 · 宜蘭五結／利工二路','Y03 · 宜蘭蘇澳／園區位置待證')
html=html.replace('<b>五千坪企業總部科技旗艦廠房</b>','<b>利澤稀有大地坪廠房</b>')
html=html.replace('<a href="https://buy.yungching.com.tw/house/7502975" target="_blank" rel="noopener noreferrer">照片與資料來源：永慶不動產 ↗</a>','<a href="'+manifest['Y03']['source']+'" target="_blank" rel="noopener noreferrer">照片來源：聯大地產 · 位置仍待核實 ↗</a>')
html=html.replace('const hero=media.Y01?.photos?.[0]','const hero=media.Y03?.photos?.[0]')
html=html.replace('原刊登照片，非本次現勘。拍攝日期、現況及標的對應仍須確認。 ${link(ph.source', '${esc(ph.caption)} ${link(ph.source')
html=html.replace('原刊登照片；非本次現勘，拍攝日期與現況仍待承辦確認。','原刊登影像（可能含周邊）；非本次現勘，請留意照片說明。')
html=html.replace('照片暫時無法載入','原站照片存取受限')
html=html.replace('請按下方「原始刊登」查看 ${p.id} 原始相簿；不以其他物件照片替代。','請按下方「原始刊登」查看 ${p.id} 原始相簿。本站不以合成圖、平台廣告或別案照片替代。')
html=html.replace('原始銷售頁／刊登照片','原始銷售頁／相簿入口')
html=html.replace('4 筆待核實線索；0 筆已證實全部符合。','4 筆待核實線索；0 筆已證實全部符合。')
# Show each image's descriptive category below its card, not only in the lightbox.
html=html.replace("const main=document.querySelector(`#${p.id} .photo-main`);main.innerHTML=", "const main=document.querySelector(`#${p.id} .photo-main`);const credit=document.querySelector(`#${p.id} .photo-credit`);const note=document.createElement('div');note.textContent=photos[0].caption;note.style.fontWeight='650';credit.prepend(note);main.innerHTML=")
(ROOT/'index.html').write_text(html,encoding='utf-8')
print(json.dumps({'photos':{k:len(v['photos']) for k,v in manifest.items()},'checks':checks},ensure_ascii=False))
