// Gemini API呼び出しモジュール

const GeminiAPI = (() => {
  const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
  // 画像生成対応モデル（Nano Banana 2）
  const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
  // テキスト分析モデル（JSON分析・更新用）
  const TEXT_MODEL = 'gemini-3.1-pro-preview';

  function getApiKey() {
    return localStorage.getItem('gemini_api_key') || '';
  }

  function setApiKey(key) {
    localStorage.setItem('gemini_api_key', key);
  }

  // フォーカスタグに応じた分析プロンプトを構築
  function buildAnalysisPrompt(focusTags, customInstruction) {
    const focusInstructions = {
      'all': `Analyze this image comprehensively. Identify ALL elements including:
- Every object/furniture (name, color, material, position, size)
- Scene type (indoor/outdoor), style, atmosphere
- Lighting conditions (direction, color temperature, intensity, shadows)
- Weather/time of day if visible
- Camera perspective (angle, focal length estimate)
- Any text, logos, or signage
- People (clothing, pose, position) if present
- Background elements and decorative details`,

      'furniture': `Focus specifically on furniture and objects in this image. For EACH item provide extremely detailed analysis:
- Exact name/type of furniture
- Color (be very specific, e.g. "warm ivory" not just "white")
- Material (e.g. "brushed oak wood", "matte ceramic")
- Position in the scene (e.g. "center-left, against wall")
- Approximate dimensions relative to the room
- Any notable details (patterns, hardware, wear)
Include even small items like cups, books, plants, decorative objects.`,

      'color_material': `Focus on colors and materials of every element in this image:
- For each visible object, describe its exact color and material/texture
- Note color relationships and palette harmony
- Identify material contrasts (matte vs glossy, rough vs smooth)
- Include walls, floors, ceilings, and architectural elements
- Note any patterns, prints, or textures`,

      'lighting': `Focus on lighting, weather, and atmospheric conditions:
- Time of day and natural light direction
- Artificial light sources (type, position, color temperature)
- Shadow characteristics (direction, softness, intensity)
- Overall mood/atmosphere
- Weather conditions if visible through windows
- Reflections and highlights
- Color cast from lighting`,

      'text_logo': `Focus on all text and logos visible in this image:
- Exact text content (character by character)
- Font style, size, weight
- Text color and background
- Position and orientation
- Any logos or brand marks (describe shape, colors, composition)
- Signage or labels`,

      'camera': `Focus on camera and perspective properties:
- Camera angle (eye-level, high angle, low angle, bird's eye, etc.)
- Estimated focal length (wide angle, normal, telephoto)
- Depth of field (shallow/deep, bokeh characteristics)
- Perspective distortion (fisheye, barrel, etc.)
- Composition (rule of thirds, symmetry, leading lines)
- Focal point placement`,

      'people': `Focus on people visible in this image:
- Number of people and their positions
- Clothing (type, color, material, style)
- Pose and body language
- Facial expression if visible
- Hair style and color
- Accessories (jewelry, glasses, bags, etc.)
- Interaction with other people or objects`
    };

    // 選択されたフォーカスのプロンプトを組み合わせる
    let prompt = 'You are an expert image analyst. ';

    if (focusTags.includes('all') || focusTags.length === 0) {
      prompt += focusInstructions['all'];
    } else {
      prompt += 'Analyze this image with focus on the following aspects:\n\n';
      focusTags.forEach(tag => {
        if (focusInstructions[tag]) {
          prompt += focusInstructions[tag] + '\n\n';
        }
      });
    }

    if (customInstruction) {
      prompt += `\n\nAdditional instruction from user: ${customInstruction}`;
    }

    prompt += `\n\nOutput your analysis as a JSON object with this structure:
{
  "scene": {
    "type": "indoor" or "outdoor" or "mixed",
    "style": "description of overall style",
    "description": "brief scene description"
  },
  "atmosphere": {
    "time_of_day": "...",
    "weather": "...",
    "lighting": {
      "type": "natural/artificial/mixed",
      "direction": "...",
      "color_temperature": "warm/neutral/cool",
      "intensity": "bright/moderate/dim",
      "shadows": "..."
    },
    "mood": "..."
  },
  "camera": {
    "angle": "...",
    "focal_length": "...",
    "depth_of_field": "...",
    "perspective": "...",
    "composition": "..."
  },
  "objects": [
    {
      "id": "unique_id",
      "name": "object name in Japanese",
      "name_en": "object name in English",
      "color": "specific color",
      "material": "specific material",
      "position": "position description",
      "details": "any additional details",
      "position_coords": { "x": 0.5, "y": 0.3 }
    }
  ],
  "text_elements": [
    {
      "id": "unique_id",
      "content": "exact text",
      "style": "font/style description",
      "position": "position description",
      "position_coords": { "x": 0.5, "y": 0.3 }
    }
  ],
  "people": [
    {
      "id": "unique_id",
      "description": "brief description",
      "clothing": "...",
      "pose": "...",
      "position": "...",
      "position_coords": { "x": 0.5, "y": 0.3 }
    }
  ]
}

Include only sections that are relevant. If no text/people/etc are found, use empty arrays.
For each element in objects, text_elements, and people, position_coords must be the approximate center of the object as a fraction of image width (x) and height (y), ranging from 0.0 to 1.0. For example, an object in the top-left quarter would have {"x": 0.25, "y": 0.25}.
Output ONLY the JSON, no other text.`;

    return prompt;
  }

  // 変更指示に基づいてJSONを更新するプロンプト（複数指示対応）
  function buildUpdatePrompt(currentJson, editInstructions) {
    let changesDescription = '';
    if (Array.isArray(editInstructions)) {
      changesDescription = editInstructions.map((item, i) =>
        `${i + 1}. Element: "${item.elementName}" → Instruction: "${item.instruction}"`
      ).join('\n');
    } else {
      // 後方互換（単一指示）
      changesDescription = `1. Element: "${editInstructions.elementName}" → Instruction: "${editInstructions.instruction}"`;
    }

    return `You have the following JSON description of an image:

${JSON.stringify(currentJson, null, 2)}

The user wants to apply the following changes:
${changesDescription}

Update the JSON to reflect ALL of these changes simultaneously. Only modify the relevant parts for each change.
If any instruction implies adding new properties or changing the structure, do so.
Output ONLY the updated JSON, no other text.`;
  }

  // JSON差分を計算（トークン削減用）
  function computeJsonDiff(original, updated) {
    const diff = {};
    const allKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);

    for (const key of allKeys) {
      const origVal = original[key];
      const updVal = updated[key];

      if (JSON.stringify(origVal) !== JSON.stringify(updVal)) {
        if (Array.isArray(origVal) && Array.isArray(updVal)) {
          // 配列: 変更された要素のみ抽出
          const changes = [];
          const maxLen = Math.max(origVal.length, updVal.length);
          for (let i = 0; i < maxLen; i++) {
            if (i >= origVal.length) {
              changes.push({ action: 'added', value: updVal[i] });
            } else if (i >= updVal.length) {
              changes.push({ action: 'removed', value: origVal[i] });
            } else if (JSON.stringify(origVal[i]) !== JSON.stringify(updVal[i])) {
              changes.push({ action: 'modified', from: origVal[i], to: updVal[i] });
            }
          }
          if (changes.length > 0) diff[key] = changes;
        } else if (typeof origVal === 'object' && origVal && typeof updVal === 'object' && updVal) {
          diff[key] = { from: origVal, to: updVal };
        } else {
          diff[key] = { from: origVal, to: updVal };
        }
      }
    }
    return diff;
  }

  // 画像生成用のプロンプトを構築（差分ベース）
  function buildGenerationPrompt(originalJson, updatedJson) {
    const diff = computeJsonDiff(originalJson, updatedJson);
    const hasDiff = Object.keys(diff).length > 0;

    if (hasDiff) {
      return `Modify this image based on the following changes.

Changes to apply:
${JSON.stringify(diff, null, 2)}

Full updated specification for reference:
${JSON.stringify(updatedJson, null, 2)}

Apply ONLY the specified changes.
Keep everything else identical to the original image - same composition, same perspective, same objects that weren't changed.
Generate the edited image.`;
    }

    // 差分が取れない場合はフォールバック
    return `Modify this image based on the following JSON specification.

Updated specification (apply these changes):
${JSON.stringify(updatedJson, null, 2)}

Keep everything else identical to the original image - same composition, same perspective, same objects that weren't changed.
Generate the edited image.`;
  }

  // 画像をBase64に変換
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 画像をリサイズ（最大1024px）
  function resizeImage(file, maxSize = 1024) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;

        // リサイズ不要な場合
        if (width <= maxSize && height <= maxSize) {
          fileToBase64(file).then(resolve).catch(reject);
          return;
        }

        // アスペクト比を維持してリサイズ
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve({ base64, mimeType: 'image/jpeg' });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // API呼び出しの共通処理（signal: AbortControllerのsignal）
  async function callAPI(model, requestBody, signal = null) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('APIキーが設定されていません。ヘッダーのAPIキー欄に入力してください。');
    }

    const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    };
    if (signal) fetchOptions.signal = signal;

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;

      if (response.status === 401 || response.status === 403) {
        throw new Error(`APIキーが無効です: ${errorMessage}`);
      } else if (response.status === 429) {
        throw new Error(`レート制限に達しました。しばらく待ってから再試行してください: ${errorMessage}`);
      } else if (response.status === 400) {
        throw new Error(`リクエストエラー: ${errorMessage}`);
      } else {
        throw new Error(`APIエラー (${response.status}): ${errorMessage}`);
      }
    }

    return response.json();
  }

  // 画像分析（要素抽出）
  async function analyzeImage(imageData, focusTags = ['all'], customInstruction = '', signal = null) {
    const prompt = buildAnalysisPrompt(focusTags, customInstruction);

    const requestBody = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64,
            },
          },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    };

    const result = await callAPI(TEXT_MODEL, requestBody, signal);

    // レスポンスからJSONを抽出
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('画像分析の結果が空でした。別の画像で試してください。');
    }

    // JSONパース（フォールバック: 最初の{から最後の}を抽出）
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('JSONの解析に失敗しました。再度お試しください。');
    }
  }

  // JSON更新（ユーザーの自然言語指示を反映）
  // editInstructions: [{ elementName, instruction }] または単一オブジェクト
  async function updateJson(currentJson, editInstructions, signal = null) {
    const prompt = buildUpdatePrompt(currentJson, editInstructions);

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    };

    const result = await callAPI(TEXT_MODEL, requestBody, signal);
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('JSON更新の結果が空でした。');
    }

    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('更新JSONの解析に失敗しました。');
    }
  }

  // 画像生成
  async function generateImage(imageData, originalJson, updatedJson, referenceImageData = null, signal = null) {
    const prompt = buildGenerationPrompt(originalJson, updatedJson);

    const parts = [
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64,
        },
      },
    ];

    // 参照画像がある場合は追加
    if (referenceImageData) {
      parts.push({
        inlineData: {
          mimeType: referenceImageData.mimeType,
          data: referenceImageData.base64,
        },
      });
    }

    parts.push({ text: prompt });

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    const result = await callAPI(IMAGE_MODEL, requestBody, signal);

    // レスポンスから画像を抽出
    const responseParts = result.candidates?.[0]?.content?.parts;
    if (!responseParts) {
      throw new Error('画像生成の結果が空でした。');
    }

    const imagePart = responseParts.find(p => p.inlineData);
    if (!imagePart) {
      // テキストのみ返された場合
      const textPart = responseParts.find(p => p.text);
      throw new Error(`画像が生成されませんでした。${textPart ? 'レスポンス: ' + textPart.text : ''}`);
    }

    return {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
      text: responseParts.find(p => p.text)?.text || '',
    };
  }

  return {
    getApiKey,
    setApiKey,
    fileToBase64,
    resizeImage,
    analyzeImage,
    updateJson,
    generateImage,
    buildAnalysisPrompt,
  };
})();
