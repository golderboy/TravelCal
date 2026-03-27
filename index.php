<?php
require_once __DIR__ . '/data/security.php';

function h(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

$pageTitle = 'โปรแกรมคำนวณเวลาเดิน ทางราชการ';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= h(csrf_token()) ?>">
    <meta name="description" content="คำนวณระยะเวลาเดินทางราชการและค่าเดินทางรถส่วนตัวแบบไป-กลับ">
    <title><?= h($pageTitle) ?></title>
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
    <main class="page-shell">
        <section class="hero-panel">
            <div>
                <h1><?= h($pageTitle) ?></h1>
            </div>
        </section>

        <section class="grid-layout" aria-label="เครื่องคำนวณ">
            <article class="panel-card" aria-labelledby="duration-title">
                <div class="panel-header">
                    <div>
                        <h2 id="duration-title">คำนวณเดินทางราชการ</h2>
                    </div>
                   
                </div>

                <form id="duration-form" class="form-grid" novalidate>
                    <fieldset class="compound-fieldset">
                        <legend>วันและเวลาออกเดินทาง</legend>
                        <div class="field-group">
							<div class="row">
								<div class="col-md-6">
									<input id="depart-date" name="depart_date" type="date" required>
									<p id="depart-helper" class="field-helper">-</p>
								</div>
								<div class="col-md-6">
									<div class="time-select-grid">
										<div>
											<select id="depart-hour" name="depart_hour" required aria-label="ชั่วโมงออกเดินทาง">
												<option value="">ชั่วโมง</option>
											</select>
										</div>
										<div class="time-colon" aria-hidden="true">:</div>
										<div>
											<select id="depart-minute" name="depart_minute" required aria-label="นาทีออกเดินทาง">
												<option value="">นาที</option>
											</select>
										</div>
									</div>
								</div>
							</div>
                           
							
                        </div>
                    </fieldset>

                    <fieldset class="compound-fieldset">
                        <legend>วันและเวลาถึงที่พัก</legend>
                        <div class="field-group">
                            
							<div class="row">
								<div class="col-md-6">
									<input id="arrival-date" name="arrival_date" type="date" required>
									<p id="arrival-helper" class="field-helper">-</p>
								</div>
								<div class="col-md-6">
									<div class="time-select-grid">
										<div>
											<select id="arrival-hour" name="arrival_hour" required aria-label="ชั่วโมงถึงที่พัก">
												<option value="">ชั่วโมง</option>
											</select>
										</div>
										<div class="time-colon" aria-hidden="true">:</div>
										<div>
											<select id="arrival-minute" name="arrival_minute" required aria-label="นาทีถึงที่พัก">
												<option value="">นาที</option>
											</select>
										</div>
									</div>
								</div>
							</div>
							
                        </div>

                    </fieldset>

                    <div class="action-row">
                        <button type="button" id="duration-calc-btn" class="btn btn-primary">คำนวณ</button>
                        <button type="reset" id="duration-reset-btn" class="btn btn-secondary">ล้างค่า</button>
                    </div>

                    <p id="duration-error" class="message message-error" role="alert" aria-live="polite"></p>
                </form>

                <section class="result-block" aria-labelledby="duration-result-title">
                    <div class="result-header">
                        <h3 id="duration-result-title">ผลลัพธ์</h3>
                        <span class="result-status" id="duration-status">พร้อมคำนวณ</span>
                    </div>

                    <div class="summary-card accent-blue">
                        <p class="summary-label">ระยะเวลาเดินทาง</p>
                        <p class="summary-value" id="duration-output">-</p>
                    </div>

                    <dl class="detail-list">
                        <div>
                            <dt>ออกเดินทาง</dt>
                            <dd id="depart-display">-</dd>
                        </div>
                        <div>
                            <dt>ถึงที่พัก</dt>
                            <dd id="arrival-display">-</dd>
                        </div>
                    </dl>
                </section>
            </article>

            <article class="panel-card" aria-labelledby="expense-title">
                <div class="panel-header">
                    <div>

                        <h2 id="expense-title">คำนวณค่าเดินทาง</h2>
                    </div>
                </div>

                <form id="expense-form" class="form-grid" novalidate>
                    <div class="field-group">
                        <label for="vehicle-type">ประเภทรถ</label>
                        <select id="vehicle-type" name="vehicle_type" required>
                            <option value="">เลือกประเภทรถ</option>
                            <option value="car">รถยนต์</option>
                            <option value="motorcycle">รถจักรยานยนต์</option>
                        </select>
                    </div>

                    <div class="field-group">
                        <label for="distance-one-way">ระยะทางขาเดียว (กม.)</label>
                        <input
                            id="distance-one-way"
                            name="distance_one_way"
                            type="number"
                            min="0"
                            step="0.01"
                            inputmode="decimal"
                            placeholder="เช่น 125.75"
                            required
                        >
                        <p class="field-tip">ระบบจะคูณ 2 ให้อัตโนมัติเป็นระยะทางไป-กลับ</p>
                    </div>

                    <div class="action-row">
                        <button type="button" id="expense-calc-btn" class="btn btn-primary">คำนวณ</button>
                        <button type="reset" id="expense-reset-btn" class="btn btn-secondary">ล้างค่า</button>
                    </div>

                    <p id="expense-error" class="message message-error" role="alert" aria-live="polite"></p>
                </form>

                <section class="result-block" aria-labelledby="expense-result-title">
                    <div class="result-header">
                        <h3 id="expense-result-title">ผลลัพธ์</h3>
                        <span class="result-status" id="expense-status">พร้อมคำนวณ</span>
                    </div>

                    <div class="result-grid">
                        <div class="summary-card accent-green">
                            <p class="summary-label">ยอดเบิกได้จริง</p>
                            <p class="summary-value" id="payable-output">-</p>
                        </div>
                        <div class="summary-card accent-gold">
                            <p class="summary-label">ระยะทางไป-กลับ</p>
                            <p class="summary-value" id="roundtrip-output">-</p>
                        </div>
                    </div>

                    <dl class="detail-list detail-list-compact">
                        <div>
                            <dt>ประเภทรถ</dt>
                            <dd id="vehicle-display">-</dd>
                        </div>
                        <div>
                            <dt>ระยะทางขาเดียว</dt>
                            <dd id="distance-display">-</dd>
                        </div>
                        <div>
                            <dt>อัตราเบิก</dt>
                            <dd id="rate-display">-</dd>
                        </div>
                        <div>
                            <dt>จำนวนเงินก่อนปัดเศษ</dt>
                            <dd id="gross-display">-</dd>
                        </div>
                    </dl>

                    <section class="formula-box" aria-labelledby="formula-title">
                        <h3 id="formula-title" class="formula-title">สูตรคำนวณ</h3>
                        <p id="formula-display" class="formula-text">-</p>
                    </section>
                </section>
            </article>
        </section>
    </main>

    <script src="assets/js/app.js"></script>
</body>
</html>
