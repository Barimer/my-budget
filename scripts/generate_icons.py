from PIL import Image, ImageDraw, ImageFilter
import os

def create_premium_wallet_icon(size=512):
    # 4배 슈퍼샘플링으로 극상의 렌더링 퀄리티
    scale = 4
    w = size * scale
    h = size * scale

    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # 1. 배경: 프리미엄 에메랄드 그라데이션 스퀘어클
    radius = int(w * 0.22)
    margin = int(w * 0.05)
    
    bg_mask = Image.new("L", (w, h), 0)
    bg_mask_draw = ImageDraw.Draw(bg_mask)
    bg_mask_draw.rounded_rectangle(
        [(margin, margin), (w - margin, h - margin)],
        radius=radius,
        fill=255
    )

    # 에메랄드 그라데이션 (#059669 -> #064E3B)
    bg_grad = Image.new("RGBA", (w, h))
    bg_draw = ImageDraw.Draw(bg_grad)
    for y in range(h):
        ratio = y / h
        r = int(16 * (1 - ratio) + 4 * ratio)
        g = int(185 * (1 - ratio) + 100 * ratio)
        b = int(129 * (1 - ratio) + 65 * ratio)
        bg_draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # 배경 그림자
    bg_shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(bg_shadow)
    sh_draw.rounded_rectangle(
        [(margin, margin + int(w * 0.035)), (w - margin, h - margin + int(w * 0.035))],
        radius=radius,
        fill=(2, 44, 34, 110)
    )
    bg_shadow = bg_shadow.filter(ImageFilter.GaussianBlur(int(w * 0.035)))

    canvas.paste(bg_shadow, (0, 0), bg_shadow)
    canvas.paste(bg_grad, (0, 0), bg_mask)

    draw = ImageDraw.Draw(canvas)

    center_x = w // 2
    center_y = h // 2

    # 2. 지갑 황금 비율 크기 설정
    wallet_w = int(w * 0.58)
    wallet_h = int(h * 0.38)
    wallet_x0 = center_x - wallet_w // 2
    wallet_y0 = center_y - int(h * 0.02)
    wallet_x1 = wallet_x0 + wallet_w
    wallet_y1 = wallet_y0 + wallet_h
    corner_r = int(w * 0.07)

    # 3. 지갑 속 신용카드 2장
    # 카드 1 (골드 VIP 카드)
    c1_w = int(wallet_w * 0.76)
    c1_h = int(wallet_h * 0.55)
    c1_x0 = center_x - c1_w // 2 - int(w * 0.03)
    c1_y0 = wallet_y0 - int(h * 0.11)
    c1_x1 = c1_x0 + c1_w
    c1_y1 = c1_y0 + c1_h

    draw.rounded_rectangle(
        [(c1_x0, c1_y0), (c1_x1, c1_y1)],
        radius=int(w * 0.025),
        fill=(251, 191, 36, 255) # Amber Gold
    )
    # 카드 1 칩
    draw.rounded_rectangle(
        [(c1_x0 + int(w * 0.03), c1_y0 + int(h * 0.025)),
         (c1_x0 + int(w * 0.07), c1_y0 + int(h * 0.055))],
        radius=int(w * 0.008),
        fill=(217, 119, 6, 255)
    )

    # 카드 2 (화이트 모던 카드)
    c2_w = int(wallet_w * 0.82)
    c2_h = int(wallet_h * 0.55)
    c2_x0 = center_x - c2_w // 2 + int(w * 0.025)
    c2_y0 = wallet_y0 - int(h * 0.07)
    c2_x1 = c2_x0 + c2_w
    c2_y1 = c2_y0 + c2_h

    # 카드 2 그림자
    draw.rounded_rectangle(
        [(c2_x0, c2_y0 + int(w * 0.01)), (c2_x1, c2_y1 + int(w * 0.01))],
        radius=int(w * 0.025),
        fill=(2, 50, 35, 80)
    )
    draw.rounded_rectangle(
        [(c2_x0, c2_y0), (c2_x1, c2_y1)],
        radius=int(w * 0.025),
        fill=(255, 255, 255, 255)
    )
    # 카드 2 은은한 마그네틱 라인
    draw.rounded_rectangle(
        [(c2_x0 + int(w * 0.03), c2_y0 + int(h * 0.025)),
         (c2_x1 - int(w * 0.03), c2_y0 + int(h * 0.045))],
        radius=int(w * 0.006),
        fill=(229, 231, 235, 255)
    )

    # 4. 프리미엄 가죽 지갑 본체 (따뜻한 카멜/탠 브라운 가죽 톤 - 에메랄드와 환상적 조화)
    # 지갑 그림자
    draw.rounded_rectangle(
        [(wallet_x0, wallet_y0 + int(w * 0.025)), (wallet_x1, wallet_y1 + int(w * 0.025))],
        radius=corner_r,
        fill=(2, 40, 28, 120)
    )

    # 지갑 뒷면 가죽
    draw.rounded_rectangle(
        [(wallet_x0, wallet_y0), (wallet_x1, wallet_y1)],
        radius=corner_r,
        fill=(180, 83, 9, 255) # Deep Tan Leather
    )

    # 지갑 앞면 포켓 (조금 더 밝고 부드러운 탠 가죽)
    pocket_y0 = wallet_y0 + int(wallet_h * 0.22)
    draw.rounded_rectangle(
        [(wallet_x0, pocket_y0), (wallet_x1, wallet_y1)],
        radius=corner_r,
        fill=(217, 119, 6, 255) # Warm Amber Leather
    )

    # 섬세한 화이트/크림 스티치(점선) 라인
    st_inset = int(w * 0.018)
    st_x0 = wallet_x0 + st_inset
    st_y0 = pocket_y0 + st_inset
    st_x1 = wallet_x1 - st_inset
    st_y1 = wallet_y1 - st_inset
    st_r = corner_r - st_inset

    # 스티치 드로잉 (부드러운 점선 디테일)
    draw.rounded_rectangle(
        [(st_x0, st_y0), (st_x1, st_y1)],
        radius=st_r,
        outline=(254, 243, 199, 140), # Cream Stitch
        width=max(int(scale * 1.5), 2)
    )

    # 5. 상단에서 덮이는 가죽 플랩 덮개 (Wallet Flap)
    flap_w = wallet_w
    flap_h = int(wallet_h * 0.44)
    flap_y0 = wallet_y0
    flap_y1 = flap_y0 + flap_h

    # 플랩 그림자
    draw.rounded_rectangle(
        [(wallet_x0, flap_y0 + int(w * 0.015)), (wallet_x1, flap_y1 + int(w * 0.015))],
        radius=corner_r,
        fill=(146, 64, 14, 130)
    )
    # 플랩 본체 (살짝 더 짙은 가죽 포인트)
    draw.rounded_rectangle(
        [(wallet_x0, flap_y0), (wallet_x1, flap_y1)],
        radius=corner_r,
        fill=(180, 83, 9, 255)
    )

    # 6. 중앙 골드 메탈릭 버클 (Clasp)
    clasp_w = int(w * 0.13)
    clasp_h = int(h * 0.16)
    clasp_x0 = center_x - clasp_w // 2
    clasp_y0 = flap_y1 - int(clasp_h * 0.5)
    clasp_x1 = clasp_x0 + clasp_w
    clasp_y1 = clasp_y0 + clasp_h

    # 버클 가죽 탭 그림자 & 본체
    draw.rounded_rectangle(
        [(clasp_x0, clasp_y0 + int(w * 0.01)), (clasp_x1, clasp_y1 + int(w * 0.01))],
        radius=int(clasp_w * 0.45),
        fill=(120, 53, 15, 120)
    )
    draw.rounded_rectangle(
        [(clasp_x0, clasp_y0), (clasp_x1, clasp_y1)],
        radius=int(clasp_w * 0.45),
        fill=(217, 119, 6, 255)
    )

    # 골드 메탈 스냅 버튼 (중앙)
    btn_r = int(w * 0.032)
    btn_cx = center_x
    btn_cy = clasp_y1 - int(clasp_h * 0.35)

    # 버튼 외곽 골드
    draw.ellipse(
        [(btn_cx - btn_r, btn_cy - btn_r + int(w * 0.004)),
         (btn_cx + btn_r, btn_cy + btn_r + int(w * 0.004))],
        fill=(120, 53, 15, 120)
    )
    draw.ellipse(
        [(btn_cx - btn_r, btn_cy - btn_r),
         (btn_cx + btn_r, btn_cy + btn_r)],
        fill=(251, 191, 36, 255)
    )
    # 버튼 내부 광택
    inner_r = int(btn_r * 0.62)
    draw.ellipse(
        [(btn_cx - inner_r, btn_cy - inner_r),
         (btn_cx + inner_r, btn_cy + inner_r)],
        fill=(254, 240, 138, 255)
    )

    # 고화질 LANCZOS 리샘플링
    return canvas.resize((size, size), Image.Resampling.LANCZOS)

public_dir = r"C:\Users\User\my-budget\public"
os.makedirs(public_dir, exist_ok=True)

# 1. 512x512
icon512 = create_premium_wallet_icon(512)
icon512.save(os.path.join(public_dir, "icon-512.png"), "PNG")

# 2. 192x192
icon192 = create_premium_wallet_icon(192)
icon192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

# 3. 180x180
icon180 = create_premium_wallet_icon(180)
icon180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

# 4. Favicon
icon64 = create_premium_wallet_icon(64)
icon64.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])

print("Successfully generated premium wallet icons!")
