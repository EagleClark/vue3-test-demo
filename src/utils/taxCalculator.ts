/**
 * 中国个人所得税税率表（月度预扣预缴）
 */
export const TAX_BRACKETS = [
  { limit: 3000, rate: 0.03, deduction: 0 },
  { limit: 12000, rate: 0.10, deduction: 210 },
  { limit: 25000, rate: 0.20, deduction: 1410 },
  { limit: 35000, rate: 0.25, deduction: 2660 },
  { limit: 55000, rate: 0.30, deduction: 4410 },
  { limit: 80000, rate: 0.35, deduction: 7160 },
  { limit: Infinity, rate: 0.45, deduction: 15160 },
]

/**
 * 中国个人所得税计算器（月度预扣预缴）
 *
 * 规则：
 * 1. 起征点：5000元
 * 2. 应纳税所得额 = 税前工资 - 五险一金 - 专项附加扣除 - 5000
 * 3. 采用7级超额累进税率
 *
 * @param grossSalary - 税前工资
 * @param insurance - 五险一金个人缴纳部分 (默认 0)
 * @param extraDeduction - 专项附加扣除 (如子女教育、房租等，默认 0)
 * @returns 计算的个人所得税金额（保留2位小数）
 */
export function calculateTax(
  grossSalary: string | number,
  insurance: number = 0,
  extraDeduction: number = 0
): number {
  // 1. 数据合法性校验
  const salaryNum = typeof grossSalary === 'string' ? Number(grossSalary) : grossSalary
  if (salaryNum < 0) throw new Error('税前工资不能为负数')
  if (insurance < 0) throw new Error('五险一金缴纳额不能为负数')
  if (extraDeduction < 0) throw new Error('专项附加扣除额不能为负数')

  // 2. 计算应纳税所得额
  const THRESHOLD = 5000
  const taxableIncome = salaryNum - insurance - extraDeduction - THRESHOLD

  // 如果应纳税所得额 <= 0，不需要交税
  if (taxableIncome <= 0) {
    return 0
  }

  // 3. 查找对应的税率档位
  const bracket = TAX_BRACKETS.find((b) => taxableIncome <= b.limit)!

  // 4. 计算税额：应纳税所得额 * 税率 - 速算扣除数
  return parseFloat((taxableIncome * bracket.rate - bracket.deduction).toFixed(2))
}
