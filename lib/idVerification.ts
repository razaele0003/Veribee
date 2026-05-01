import * as ImagePicker from 'expo-image-picker';

export type IdSide = 'front' | 'back';

export type CapturedIdImage = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string | null;
};

export type LocalIdCheck = {
  status: 'ready_for_review' | 'needs_more_evidence';
  score: number;
  checks: string[];
};

export async function captureIdImage(): Promise<CapturedIdImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.82,
  });

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName,
  };
}

export function evaluateIdImages(
  idType: string,
  front: CapturedIdImage | null,
  back: CapturedIdImage | null,
): LocalIdCheck {
  const checks: string[] = [];
  let score = 20;

  if (idType) {
    score += 15;
    checks.push(`${idType} selected`);
  }
  if (front) {
    score += 30;
    checks.push('Front image captured');
  }
  if (back) {
    score += 25;
    checks.push('Back image captured');
  }
  if (front?.width && front?.height && front.width >= 700 && front.height >= 450) {
    score += 5;
    checks.push('Front image resolution is reviewable');
  }
  if (back?.width && back?.height && back.width >= 700 && back.height >= 450) {
    score += 5;
    checks.push('Back image resolution is reviewable');
  }

  const finalScore = Math.min(score, 100);
  return {
    status: finalScore >= 80 ? 'ready_for_review' : 'needs_more_evidence',
    score: finalScore,
    checks,
  };
}
