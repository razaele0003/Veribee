import type { ProductDraft, LocalProduct } from '@/store/sellerStore';

export type VsiBreakdownItem = {
  label: string;
  weight: number;
  score: number;
};

export type SellerSignals = {
  successfulDeliveries: number;
  totalDeliveries: number;
  verifiedProducts: number;
  totalProducts: number;
  satisfiedOrders: number;
  reviewedOrders: number;
  disputes: number;
  totalOrders: number;
  accountAgeDays: number;
  kycApproved: boolean;
};

export type AiScannerResult = {
  score: number;
  status: LocalProduct['authStatus'];
  resultText: string;
  evidence: string[];
  reviewerNotes?: string;
};

export const DEMO_SELLER_SIGNALS: SellerSignals = {
  successfulDeliveries: 94,
  totalDeliveries: 99,
  verifiedProducts: 28,
  totalProducts: 30,
  satisfiedOrders: 91,
  reviewedOrders: 96,
  disputes: 2,
  totalOrders: 112,
  accountAgeDays: 438,
  kycApproved: true,
};

function clampScore(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function ratioScore(numerator: number, denominator: number, fallback: number) {
  if (denominator <= 0) return fallback;
  return clampScore((numerator / denominator) * 100);
}

export function getVsiBreakdown(signals: SellerSignals = DEMO_SELLER_SIGNALS): VsiBreakdownItem[] {
  const deliveryScore = ratioScore(signals.successfulDeliveries, signals.totalDeliveries, 80);
  const authScore = ratioScore(signals.verifiedProducts, signals.totalProducts, 75);
  const satisfactionScore = ratioScore(signals.satisfiedOrders, signals.reviewedOrders, 80);
  const disputeScore = ratioScore(
    Math.max(signals.totalOrders - signals.disputes, 0),
    signals.totalOrders,
    85,
  );
  const accountScore = clampScore(
    Math.min(signals.accountAgeDays / 365, 1) * 75 + (signals.kycApproved ? 25 : 0),
  );

  return [
    { label: 'Successful Deliveries', weight: 30, score: deliveryScore },
    { label: 'Authentication Pass Rate', weight: 25, score: authScore },
    { label: 'Buyer Satisfaction', weight: 20, score: satisfactionScore },
    { label: 'Low Dispute Rate', weight: 15, score: disputeScore },
    { label: 'Account History', weight: 10, score: accountScore },
  ];
}

export function calculateVsiScore(signals: SellerSignals = DEMO_SELLER_SIGNALS) {
  const breakdown = getVsiBreakdown(signals);
  const weightedTotal = breakdown.reduce(
    (total, item) => total + item.score * (item.weight / 100),
    0,
  );
  return clampScore(weightedTotal);
}

export function calculateSellerVsiFromProducts(products: LocalProduct[]) {
  if (products.length === 0) return calculateVsiScore();
  const verifiedProducts = products.filter((product) => product.authStatus === 'verified').length;
  const failedProducts = products.filter((product) => product.authStatus === 'failed').length;

  return calculateVsiScore({
    ...DEMO_SELLER_SIGNALS,
    verifiedProducts,
    totalProducts: products.length,
    disputes: DEMO_SELLER_SIGNALS.disputes + failedProducts,
  });
}

function serialLooksUsable(serialNumber: string) {
  const value = serialNumber.trim();
  return value.length >= 8 && /[A-Z0-9]/i.test(value) && /[-0-9]/.test(value);
}

export function runLocalAiScanner(draft: ProductDraft): AiScannerResult {
  const price = Number(draft.price || 0);
  const hasPhoto = draft.photos.length > 0;
  const evidenceCount = draft.evidencePhotos.length;
  const hasCoreDetails = Boolean(draft.title.trim() && draft.category.trim() && draft.brand.trim());
  const hasModel = Boolean(draft.model.trim());
  const hasSerial = serialLooksUsable(draft.serialNumber);
  const highValue = price >= 10000;

  const serialScore = hasSerial ? 25 : draft.serialNumber.trim() ? 12 : 0;
  const evidenceScore = Math.min(evidenceCount, 4) * 5;
  const imageScore = hasPhoto ? 20 : 0;
  const detailScore = (hasCoreDetails ? 10 : 0) + (hasModel ? 5 : 0);
  const riskScore = highValue ? (evidenceCount >= 3 && hasSerial ? 20 : 10) : 18;
  const score = clampScore(serialScore + evidenceScore + imageScore + detailScore + riskScore);

  const status: LocalProduct['authStatus'] =
    score >= 85 ? 'verified' : score >= 60 ? 'pending' : 'failed';

  const evidence = [
    hasSerial ? 'Serial format check passed' : 'Serial evidence incomplete',
    hasPhoto ? 'Product image supplied' : 'Product image missing',
    `${evidenceCount}/4 evidence photos supplied`,
    hasCoreDetails ? 'Brand and category details present' : 'Brand/category details incomplete',
    highValue ? 'High-value handover requires OTP or biometric confirmation' : 'Standard OTP handover eligible',
  ];

  const resultText =
    status === 'verified'
      ? 'Local Veribee scanner passed serial format, evidence completeness, image presence, and seller risk checks.'
      : status === 'pending'
        ? 'Local Veribee scanner found enough evidence to review, but confidence is below the verified threshold.'
        : 'Local Veribee scanner found missing or conflicting authentication evidence.';

  return {
    score,
    status,
    resultText,
    evidence,
    reviewerNotes:
      status === 'verified'
        ? undefined
        : 'Add clearer serial, label, receipt, and full-product evidence to improve scanner confidence.',
  };
}
