from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import os

def create_app_icon(size=512):
    # 2배 슈퍼샘플링으로 초고화질 안티앨리어싱
    scale = 2
    w = size * scale
    h = size * scale

    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. 둥근 사각형(Squircle) 배경 그라데이션
    # 에메랄드 그린 그라데이션: 상단(#10B981) -> 하단(#047857)
    radius = int(w * 0.22) # 모바일 앱 표준 둥글기
    
    # 임시 그라데이션 버퍼
    grad = Image.new("RGBA", (w, h))
    grad_draw = ImageDraw.Draw(grad)
    for y in range(h):
        ratio = y / h
        # 16, 185, 129 -> 4, 120, 87
        r = int(16 * (1 - ratio) + 4 * ratio)
        g = int(185 * (1 - ratio) + 120 * ratio)
        b = int(129 * (1 - ratio) + 87 * ratio)
        grad_draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # 마스크 생성 (둥근 사각형)
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    margin = int(w * 0.04) # 살짝 안쪽 여백
    mask_draw.rounded_rectangle(
        [(margin, margin), (w - margin, h - margin)],
        radius=radius,
        fill=255
    )

    # 배경에 부드러운 하단 그림자 효과
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        [(margin, margin + int(w * 0.03)), (w - margin, h - margin + int(w * 0.03))],
        radius=radius,
        fill=(0, 40, 20, 100)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(w * 0.04)))

    # 합치기
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(shadow, (0, 0), shadow)
    canvas.paste(grad, (0, 0), mask)

    # 2. 내부 그래픽 그리기 (지갑 & 골드 코인 & 성장 바)
    draw_canvas = ImageDraw.Draw(canvas)

    center_x = w // 2
    center_y = h // 2

    # A. 현대적인 가계부 지갑 본체 (Wallet Body)
    wallet_w = int(w * 0.52)
    wallet_h = int(h * 0.38)
    wallet_x0 = center_x - wallet_w // 2
    wallet_y0 = center_y - int(h * 0.08)
    wallet_x1 = wallet_x0 + wallet_w
    wallet_y1 = wallet_y0 + wallet_h

    # 지갑 그림자
    draw_canvas.rounded_rectangle(
        [(wallet_x0, wallet_y0 + int(w * 0.03)), (wallet_x1, wallet_y1 + int(w * 0.03))],
        radius=int(w * 0.07),
        fill=(2, 60, 40, 120)
    )

    # 지갑 본체 (밝은 아이보리/퓨어 화이트)
    draw_canvas.rounded_rectangle(
        [(wallet_x0, wallet_y0), (wallet_x1, wallet_y1)],
        radius=int(w * 0.07),
        fill=(255, 255, 255, 250)
    )

    # 지갑 상단 덮개 띠 (민트 액센트)
    flap_h = int(wallet_h * 0.42)
    draw_canvas.rounded_rectangle(
        [(wallet_x0, wallet_y0), (wallet_x1, wallet_y0 + flap_h)],
        radius=int(w * 0.07),
        fill=(236, 253, 245, 255)
    )

    # B. 지갑 버클 / 잠금장치 (우측)
    clasp_w = int(w * 0.16)
    clasp_h = int(h * 0.14)
    clasp_x0 = wallet_x1 - int(clasp_w * 0.75)
    clasp_y0 = wallet_y0 + int(wallet_h * 0.28)
    clasp_x1 = clasp_x0 + clasp_w
    clasp_y1 = clasp_y0 + clasp_h

    # 버클 본체
    draw_canvas.rounded_rectangle(
        [(clasp_x0, clasp_y0), (clasp_x1, clasp_y1)],
        radius=int(clasp_h * 0.4),
        fill=(16, 185, 129, 255)
    )
    # 버클 내부 금빛 단추
    btn_r = int(clasp_h * 0.2)
    btn_cx = (clasp_x0 + clasp_x1) // 2
    btn_cy = (clasp_y0 + clasp_y1) // 2
    draw_canvas.ellipse(
        [(btn_cx - btn_r, btn_cy - btn_r), (btn_cx + btn_r, btn_cy + btn_r)],
        fill=(251, 191, 36, 255)
    )

    # C. 지갑 위로 떠오르는 반짝이는 황금 코인 (Gold Coin with Won/Dollar feel)
    coin_r = int(w * 0.15)
    coin_cx = center_x - int(w * 0.12)
    coin_cy = wallet_y0 - int(h * 0.08)

    # 코인 그림자
    draw_canvas.ellipse(
        [(coin_cx - coin_r + 4, coin_cy - coin_r + 14), (coin_cx + coin_r + 4, coin_cy + coin_r + 14)],
        fill=(4, 90, 60, 100)
    )
    # 코인 외곽 (골드)
    draw_canvas.ellipse(
        [(coin_cx - coin_r, coin_cy - coin_r), (coin_cx + coin_r, coin_cy + coin_r)],
        fill=(245, 158, 11, 255)
    )
    # 코인 내부 (밝은 앰버 골드)
    inner_coin_r = int(coin_r * 0.82)
    draw_canvas.ellipse(
        [(coin_cx - inner_coin_r, coin_cy - inner_coin_r), (coin_cx + inner_coin_r, coin_cy + inner_coin_r)],
        fill=(252, 211, 77, 255)
    )

    # 코인 중앙 원 기호 ₩ 심볼 드로잉
    # 가로선 2개, V자 형태
    sym_w = int(inner_coin_r * 0.65)
    sym_h = int(inner_coin_r * 0.75)
    v_top = coin_cy - sym_h // 2
    v_bot = coin_cy + sym_h // 2
    line_w = max(int(scale * 3.5), 4)

    # W / ₩ 형태
    p1 = (coin_cx - sym_w, v_top)
    p2 = (coin_cx - sym_w // 3, v_bot)
    p3 = (coin_cx, v_top + int(sym_h * 0.25))
    p4 = (coin_cx + sym_w // 3, v_bot)
    p5 = (coin_cx + sym_w, v_top)
    draw_canvas.line([p1, p2, p3, p4, p5], fill=(180, 83, 9, 255), width=line_w, joint='curve')
    # 가로선
    bar_y1 = coin_cy - int(sym_h * 0.08)
    draw_canvas.line([(coin_cx - sym_w, bar_y1), (coin_cx + sym_w, bar_y1)], fill=(180, 83, 9, 255), width=line_w)

    # D. 지갑에서 올라오는 상승 통계 막대 3개 (차트 심볼)
    chart_cx = center_x + int(w * 0.16)
    chart_base_y = wallet_y0 - int(h * 0.03)
    bar_w = int(w * 0.05)
    gap = int(w * 0.02)

    heights = [int(h * 0.10), int(h * 0.17), int(h * 0.24)]
    colors = [(209, 250, 229, 230), (167, 243, 208, 240), (255, 255, 255, 255)]

    for idx, (bh, col) in enumerate(zip(heights, colors)):
        bx0 = chart_cx + idx * (bar_w + gap) - int(w * 0.08)
        by0 = chart_base_y - bh
        bx1 = bx0 + bar_w
        by1 = chart_base_y
        draw_canvas.rounded_rectangle(
            [(bx0, by0), (bx1, by1)],
            radius=int(bar_w * 0.4),
            fill=col
        )

    # E. 우측 상단 반짝이는 스파클(Sparkle 별)
    star_x = chart_cx + int(w * 0.11)
    star_y = chart_base_y - int(h * 0.28)
    star_r = int(w * 0.05)
    draw_canvas.polygon([
        (star_x, star_y - star_r),
        (star_x + int(star_r * 0.28), star_y - int(star_r * 0.28)),
        (star_x + star_r, star_y),
        (star_x + int(star_r * 0.28), star_y + int(star_r * 0.28)),
        (star_x, star_y + star_r),
        (star_x - int(star_r * 0.28), star_y + int(star_r * 0.28)),
        (star_x - star_r, star_y),
        (star_x - int(star_r * 0.28), star_y - int(star_r * 0.28)),
    ], fill=(255, 255, 255, 250))

    # 리샘플링하여 최종 크기로 축소 (최고급 안티앨리어싱)
    final_img = canvas.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# 생성 및 저장
public_dir = r"C:\Users\User\my-budget\public"
os.makedirs(public_dir, exist_ok=True)

# 1. 512x512
icon512 = create_app_icon(512)
icon512.save(os.path.join(public_dir, "icon-512.png"), "PNG")

# 2. 192x192
icon192 = create_app_icon(192)
icon192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

# 3. 180x180 (Apple Touch Icon)
icon180 = create_app_icon(180)
icon180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

# 4. Favicon (64x64)
icon64 = create_app_icon(64)
icon64.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])

print("Successfully generated all icons!")
