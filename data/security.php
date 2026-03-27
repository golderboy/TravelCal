<?php
// web/data/security.php

// อย่ามี output ก่อนหน้านี้เด็ดขาด

// ===== Session Hardening =====
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure',   1); // ถ้า dev ยังไม่ HTTPS ให้ตั้งเป็น 0 ชั่วคราว
ini_set('session.cookie_samesite', 'Strict');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CSRF
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
function csrf_token(): string { return $_SESSION['csrf_token']; }
function verify_csrf(string $t): bool { return hash_equals($_SESSION['csrf_token'], $t); }

// ===== สร้าง nonce ต่อคำขอ (ห้าม reuse) =====
$csp_nonce = base64_encode(random_bytes(16));

// ===== Security Headers =====
header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
header("X-Frame-Options: SAMEORIGIN");                // เผื่อเบราว์เซอร์เก่า
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");

// หมายเหตุ:
// - ย้าย inline script/style ไปไฟล์ภายนอกจะดีที่สุด
// - ถ้าจำเป็นต้อง inline ให้เติม nonce ลงในแท็ก <script>/<style>
// - หลีกเลี่ยง style attributes และ on* attributes (เช่น onclick)
$csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",          // ต้องอยู่ใน header เท่านั้น
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",

  // อนุญาตสคริปต์จากตัวเอง + inline ที่มี nonce เท่านั้น
  "script-src 'self' 'nonce-{$csp_nonce}'",

  // อนุญาตสไตล์จากตัวเอง + inline <style> ที่มี nonce (ไม่ครอบคลุม style attribute)
  "style-src 'self' 'nonce-{$csp_nonce}'",

  // ไฟล์รูป/ฟอนต์ ถ้าต้องฝัง data: (เช่น inline svg/font) ให้เปิด data: อย่างจำกัด
  "img-src 'self' data:",
  "font-src 'self' data:",

  // ถ้ามี AJAX/Fetch ออกนอกโดเมน ให้เพิ่มต้นทางใน connect-src
  "connect-src 'self'",

  // ถ้าใช้ worker หรือ wasm ให้ค่อยเปิดตามต้องการ:
  // "worker-src 'self'",
  // "script-src-elem 'self' 'nonce-{$csp_nonce}'",
];

header("Content-Security-Policy: " . implode("; ", $csp));
