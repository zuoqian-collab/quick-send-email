import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ReleaseNote {
  platform: 'all' | 'mobile' | 'desktop';
  emoji: string;
  label: string;
  content: string;
}

interface GenerateResponse {
  notes: ReleaseNote[];
  html: string;
}

const SYSTEM_PROMPT = `你是一个专业的产品经理助手，帮助整理软件更新日志。

你的任务是从原始的版本更新日志中提取值得对用户说的重要更新，并按平台分类。

规则：
1. 只提取用户真正关心的功能更新，忽略技术细节和小bug修复
2. 用简洁、用户友好的语言描述每个更新
3. 按三个平台分类：All Platforms（所有平台通用）、Mobile（移动端）、Desktop（桌面端）
4. 每个平台的更新用简短的一句话或要点列表描述
5. 如果某个平台没有更新，可以省略
6. 使用英文输出

输出JSON格式：
{
  "notes": [
    {
      "platform": "all" | "mobile" | "desktop",
      "emoji": "📍" | "📱" | "💻",
      "label": "All Platforms" | "Mobile" | "Desktop",
      "content": "更新内容描述"
    }
  ]
}

注意：
- platform为"all"时，emoji用"📍"，label用"All Platforms"
- platform为"mobile"时，emoji用"📱"，label用"Mobile"
- platform为"desktop"时，emoji用"💻"，label用"Desktop"
- content可以是单行描述，或者用"• "分隔的多行要点`;

function generateHtmlFromNotes(notes: ReleaseNote[], bannerUrl?: string): string {
  const banner = bannerUrl || 'https://download.filomail.com/public/assets/20251215-180812.png';
  
  const notesHtml = notes.map(note => `
                                <tr>
                                  <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                                    <span style="font-size: 20px;">${note.emoji}</span>
                                  </td>
                                  <td style="padding: 10px 0; vertical-align: top;">
                                    <strong style="color: #0D93F3;">${note.label}</strong><br>
                                    <span style="color: #002346;">${note.content.replace(/\n/g, '<br>')}</span>
                                  </td>
                                </tr>`).join('');

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]>
<xml><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:DontUseAdvancedTypographyReadingMail/></w:WordDocument>
<o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml>
<![endif]--><!--[if !mso]><!--><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		sup,
		sub {
			font-size: 75%;
			line-height: 0;
		}

		@media (max-width:620px) {

			.row-1 .column-1 .block-5.social_block .alignment table,
			.social_block.desktop_hide .social-table {
				display: inline-block !important;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}

			.row-1 .column-1 .block-3.paragraph_block td.pad>div {
				text-align: left !important;
				font-size: 16px !important;
			}

			.row-1 .column-1 .block-3.paragraph_block td.pad {
				padding: 10px !important;
			}

			.row-1 .column-1 .block-5.social_block td.pad {
				padding: 10px 0 10px 10px !important;
			}

			.row-1 .column-1 .block-5.social_block .alignment {
				text-align: left !important;
			}
		}
	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>

<body class="body" style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px; margin: 0 auto;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<!-- Banner 图片 -->
													<table class="image_block" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="left">
																	<img src="${banner}" style="display: block; height: auto; border: 0; max-width: 100%; border-radius: 12px;" width="580" alt title height="auto">
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
													<table class="paragraph_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;direction:ltr;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.8;text-align:left;mso-line-height-alt:29px;">
																	<p style="margin: 0; margin-bottom: 20px;">Hi {{first_name}},</p>
																	<p style="margin: 0; margin-bottom: 16px;">Here is a quick look at what changed in Filo this week - all focused on helping you stay on top of what matters.</p>
																</div>
																<!-- 更新内容卡片 -->
																<div style="background-color: #EEF9FF; border-radius: 12px; padding: 20px 24px; margin: 20px 0; border-left: 4px solid #22A0FB;">
																	<table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; color: #002346; line-height: 1.6;">
${notesHtml}
																	</table>
																</div>
																<div style="color:#101112;direction:ltr;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:1.8;text-align:left;mso-line-height-alt:29px;">
																	<p style="margin: 0; margin-bottom: 16px; font-weight: 600; color: #002346;">📋 Full release notes</p>
																	<p style="margin: 0; margin-bottom: 16px;">Want every detail, including bug fixes and smaller tweaks? <a href="https://www.filomail.com/releases" target="_blank" style="text-decoration: underline; color: #0D93F3;" rel="noopener">Read the full release notes</a> on our website or check the <a href="https://discord.gg/4mZyUn2JjJ" target="_blank" style="text-decoration: underline; color: #0D93F3;" rel="noopener">#📲｜release-notes</a> channel on Discord.</p>
																	<p style="margin: 0; margin-bottom: 16px;">If anything feels confusing or off, just write to <a href="mailto:support@filomail.com" target="_blank" style="text-decoration: underline; color: #0D93F3;" rel="noopener">support@filomail.com</a> or drop a note in Discord. Your feedback guides what we ship next.</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0;">Thanks for using Filo 💙<br><strong>The Filo Team</strong></p>
																</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-4" style="height:60px;line-height:60px;font-size:1px;">&#8202;</div>
													<table class="social_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding: 10px 0 10px 10px; text-align: left;">
																<div class="alignment" align="left" style="text-align: left;">
																	<table class="social-table" width="208px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
																		<tr>
																			<td style="padding:0 20px 0 0;"><a href="https://x.com/Filo_Mail" target="_blank"><img src="https://download.filomail.com/public/assets/X.png" width="24" height="22" alt="X" title="X" style="display: block; width: 24px; height: 22px; border: 0;"></a></td>
																			<td style="padding:0 20px 0 0;"><a href="https://discord.gg/filo-mail" target="_blank"><img src="https://download.filomail.com/public/assets/Discord.png" width="26" height="20" alt="Discord" title="Discord" style="display: block; width: 26px; height: 20px; border: 0;"></a></td>
																			<td style="padding:0 20px 0 0;"><a href="https://www.instagram.com/filo_mail/" target="_blank"><img src="https://download.filomail.com/public/assets/Instagram.png" width="24" height="24" alt="Instagram" title="Instagram" style="display: block; width: 24px; height: 24px; border: 0;"></a></td>
																			<td style="padding:0 20px 0 0;"><a href="https://www.youtube.com/@Filo-Mail" target="_blank"><img src="https://download.filomail.com/public/assets/YouTube.png" width="26" height="18" alt="YouTube" title="YouTube" style="display: block; width: 26px; height: 18px; border: 0;"></a></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-6" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#a6a6a6;direction:ltr;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:12px;font-weight:400;letter-spacing:0px;line-height:1.5;text-align:left;mso-line-height-alt:18px;">
																	<p style="margin: 0;">You're receiving this because you signed up for Filo Mail and opted in to our onboarding emails.<br>FILO AI PTE. LTD., 144 Robinson Rd #12-01, Singapore 068908<br><a href="{{amazonSESUnsubscribeUrl}}" target="_blank" rel="noopener" style="text-decoration: underline; color: #a6a6a6;">Unsubscribe</a></p>
																</div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rawNotes, bannerUrl } = req.body;

    if (!rawNotes || typeof rawNotes !== 'string') {
      return res.status(400).json({ error: 'Missing raw release notes text' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ 
        error: 'Missing OPENAI_API_KEY. Please configure it in environment variables.' 
      });
    }

    console.log('🔮 Processing release notes with AI...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请整理以下版本更新日志：\n\n${rawNotes}` },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to process with AI',
        details: errorData,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const parsed = JSON.parse(content) as { notes: ReleaseNote[] };
    const html = generateHtmlFromNotes(parsed.notes, bannerUrl);

    console.log('✅ Generated release notes HTML successfully');

    return res.status(200).json({
      notes: parsed.notes,
      html,
    } as GenerateResponse);

  } catch (e: any) {
    console.error('❌ Failed to generate release notes:', e);
    return res.status(500).json({
      error: 'Failed to generate release notes',
      details: e?.message || String(e),
    });
  }
}



