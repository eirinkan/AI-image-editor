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
      'all': `Analyze this image exhaustively. Your goal is to detect AS MANY elements as possible — the user needs a comprehensive inventory of everything visible in this image. Do NOT skip anything, even if it seems small, partially visible, or unimportant.

Identify ALL elements in these categories:
- Large furniture & major objects (tables, chairs, sofas, beds, shelves, cabinets, appliances, etc.)
- Small objects & accessories (cups, books, plants, vases, remote controls, cushions, picture frames, candles, bottles, bags, etc.)
- Decorative elements (artwork, posters, wall hangings, ornaments, figurines, patterns on fabric, etc.)
- Architectural elements (doors, windows, walls, columns, stairs, railings, moldings, ceiling fixtures, outlets, switches, etc.)
- Surfaces & materials (flooring type, wall finish, countertop material, rug/carpet, curtains/blinds, etc.)
- Background elements (items partially visible, objects seen through windows, reflections in mirrors, etc.)
- Lighting fixtures (lamps, ceiling lights, sconces, candles, LED strips, natural light sources)
- Text, logos, signage, labels on any object
- People (clothing, pose, position, accessories) if present
- Scene type (indoor/outdoor), style, atmosphere
- Weather/time of day if visible
- Camera perspective (angle, focal length estimate)

IMPORTANT: List at least 15-30 objects in the "objects" array. Even mundane items like a power outlet, a door handle, a shadow on the wall, or a fold in a curtain should be listed. More is always better — the user will select which elements to edit.`,

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

IMPORTANT: Detect as many elements as possible. It is far better to include too many elements than too few — the user needs a rich inventory to choose from. If no text/people/etc are found, use empty arrays.
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

  // プロンプトエンジニア：日本語入力を高品質な英語プロンプトに変換
  async function craftPrompt(userInput, signal = null) {
    const systemPrompt = `あなたは画像生成AI「Gemini」の機能を熟知したプロンプトエンジニアです。
ユーザーの日本語による指示を、高品質な画像生成用英語プロンプトに変換することがあなたの使命です。

## 制約
- 英語出力: プロンプト本文は必ず英語で記述
- 肯定的記述: 否定形（no cars）ではなく肯定形（empty deserted street）で表現
- 具体性の徹底: 色、素材、形状、照明を具体的に記述（例: "fantasy armor"ではなく"ornate elven plate armor with silver leaf etchings"）
- テキストの正確性: 画像内テキストは指定内容を一字一句正確に反映
- 画像内テキストの言語: 特に指定がない限り日本語を使用（ブランド名が英語の場合を除く）
- フォトリアリズム: 商品写真は過度な加工感を避け、スタジオ撮影品質を優先

## プロンプト構造
基本構造: [Subject], [Environment], [Lighting], [Style], [Camera/Technical details]
テキスト指定: text "[TEXT]" の形式で明確に指示

## 出力フォーマット（JSON）
{
  "prompt": "英語のプロンプト全文（そのまま画像生成に使用できる形式）",
  "recommended_settings": {
    "aspect_ratio": "用途に最適な比率（1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9）",
    "resolution": "2K または 4K"
  },
  "explanation": "プロンプトの各要素について日本語で解説。なぜその構図・照明・スタイルを選んだか、テキストの言語選択の理由なども含める。マークダウン形式で見やすく。"
}`;

    const requestBody = {
      contents: [{
        parts: [{ text: userInput }],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    };

    // system_instruction を使用（Gemini REST API形式）
    requestBody.system_instruction = { parts: [{ text: systemPrompt }] };

    const result = await callAPI(TEXT_MODEL, requestBody, signal);
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('プロンプト生成の結果が空でした。');

    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('プロンプトの解析に失敗しました。');
    }
  }

  // テキストから画像生成（text-to-image）
  async function generateFromText(prompt, options = {}, signal = null) {
    const { aspectRatio = '1:1', imageSize = '1K' } = options;

    const generationConfig = {
      responseModalities: ['TEXT', 'IMAGE'],
    };

    // アスペクト比・解像度の指定
    if (aspectRatio || imageSize) {
      generationConfig.image_config = {};
      if (aspectRatio) generationConfig.image_config.aspect_ratio = aspectRatio;
      if (imageSize) generationConfig.image_config.image_size = imageSize;
    }

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    };

    const result = await callAPI(IMAGE_MODEL, requestBody, signal);

    const responseParts = result.candidates?.[0]?.content?.parts;
    if (!responseParts) {
      throw new Error('画像生成の結果が空でした。');
    }

    const imagePart = responseParts.find(p => p.inlineData);
    if (!imagePart) {
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
    generateFromText,
    craftPrompt,
    buildAnalysisPrompt,
  };
})();
