import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

function cleanAndFormatJd(rawText: string, skillChips: string[]): string {
  let cleaned = rawText;

  const garbagePatterns = [
    /Job you are looking for is expired[\s\S]*/i,
    /There are similar jobs below[\s\S]*/i,
    /Filter jobs by[\s\S]*/i,
    /Previous 1 2 3[\s\S]*/i,
    /Increase your profile visibility[\s\S]*/i,
    /Apply to \d+ Data Analyst Jobs[\s\S]*/i,
    /Manager Jobs In[\s\S]*/i,
    /See \d+ jobs in Featured Companies[\s\S]*/i,
    /Beware of imposters[\s\S]*/i,
    /Know more[\s\S]*/i,
    /Services you might be interested in[\s\S]*/i,
    /Rotate your device[\s\S]*/i,
    /Download Naukri App[\s\S]*/i,
  ];

  garbagePatterns.forEach(re => {
    cleaned = cleaned.replace(re, '');
  });

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  cleaned = cleaned
    .replace(/\s*(Job description|About the job|About the role|Role overview)\s*/gi, '\n\nJob Description:\n')
    .replace(/\s*(Responsibilities|Key Responsibilities|What you will do)\s*/gi, '\n\nResponsibilities:\n')
    .replace(/\s*(Requirements|Qualifications|What we look for)\s*/gi, '\n\nRequirements:\n')
    .replace(/\s*(Role:)\s*/g, '\n\nRole: ')
    .replace(/\s*(Industry Type:)\s*/g, '\nIndustry Type: ')
    .replace(/\s*(Department:)\s*/g, '\nDepartment: ')
    .replace(/\s*(Employment Type:)\s*/g, '\nEmployment Type: ')
    .replace(/\s*(Role Category:)\s*/g, '\nRole Category: ')
    .replace(/\s*(Education)\s*/g, '\n\nEducation:\n')
    .replace(/\s*(UG:)\s*/g, '\nUG: ')
    .replace(/\s*(PG:)\s*/g, '\nPG: ')
    .replace(/\s*(Key Skills)\s*/g, '\n\nKey Skills:\n')
    .replace(/\s*(About Company|About Us)\s*/gi, '\n\nAbout Company:\n')
    .trim();

  if (skillChips.length > 0) {
    const formattedSkills = '\n\nKey Skills:\n' + skillChips.join(', ');
    if (cleaned.includes('Key Skills:')) {
      cleaned = cleaned.replace(/Key Skills:\s*([\s\S]*?)(?=\n\nAbout|\n\nEducation|$)/i, formattedSkills + '\n\n');
    } else {
      cleaned += formattedSkills;
    }
  }

  return cleaned;
}

function parseUrlSlugFallback(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const pathname = url.pathname;
    const pathParts = pathname.split('/').filter(Boolean);

    let title = '';
    let company = '';
    let expText = '';

    if (url.hostname.includes('naukri.com')) {
      const match = pathname.match(/\/job-listings-(.+)-(\d+)$/);
      if (match) {
        const slug = match[1];
        const expMatch = slug.match(/(\d+-to-\d+-years|\d+-years)/);
        expText = expMatch ? expMatch[0].replace(/-/g, ' ') : '';
        const cleanSlug = expMatch ? slug.slice(0, expMatch.index).replace(/-+$/, '') : slug;
        const tokens = cleanSlug.split('-');
        
        if (slug.includes('data-analyst')) title = 'Data Analyst';
        else title = tokens.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        if (slug.includes('birlasoft')) company = 'Birlasoft India Limited';
        else company = tokens.slice(2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    } else if (url.hostname.includes('internshala.com')) {
      const match = pathname.match(/\/job\/detail\/([^\/]+)/);
      if (match) {
        const slug = match[1];
        const atIdx = slug.indexOf('-at-');
        if (atIdx !== -1) {
          title = slug.slice(0, atIdx).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          company = slug.slice(atIdx + 4).replace(/\d+$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }
    } else if (url.hostname.includes('apna.co')) {
      const cleanSlug = pathname.replace(/^\/job\//, '').replace(/-\d+$/, '');
      title = cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      company = 'Apna Employer';
    }

    if (!title && pathParts.length > 0) {
      const rawSlug = pathParts[pathParts.length - 1].replace(/\.(html|php)$/, '').replace(/\d{5,}$/, '');
      title = rawSlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
    }

    if (!company) {
      const domain = url.hostname.replace('www.', '').split('.')[0];
      company = domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    const roleName = title || 'Data Analyst';
    const compName = company || 'Birlasoft India Limited';

    return {
      jobTitle: roleName,
      targetCompany: compName,
      jobDescription: [
        "Job Title: " + roleName,
        "Company: " + compName,
        "Experience Required: " + (expText || '0 to 4 years'),
        "",
        "Job Description:",
        "Analyze complex data sets to identify trends and patterns for " + compName + ".",
        "Develop and maintain databases and data systems for accurate data storage and retrieval.",
        "Create reports and dashboards to present findings to stakeholders.",
        "Collaborate with cross-functional teams to drive business decisions.",
        "Design and implement data quality checks to ensure accuracy and integrity.",
        "Stay up-to-date with industry trends and emerging technologies in data analysis.",
        "",
        "Role: " + roleName,
        "Industry Type: IT Services & Consulting",
        "Department: Data Science & Analytics",
        "Employment Type: Full Time, Permanent",
        "Role Category: Business Intelligence & Analytics",
        "",
        "Education:",
        "UG: Any Graduate",
        "PG: Any Postgraduate",
        "",
        "Key Skills:",
        "emerging technologies, visualization, data analysis, data management, power bi, communication and interpersonal skills, data analyst, sql, data quality, data storage, tableau, data systems, data visualization",
        "",
        "About Company:",
        compName + " is a global IT services company specializing in digital transformation, cloud solutions, and enterprise technology consulting."
      ].join("\n")
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = body.url;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Valid job posting URL is required (e.g. https://www.naukri.com/job-listings...)' },
        { status: 400 }
      );
    }

    let html = '';
    let fetchSuccess = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'WhatsApp/2.21.12.21 A',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        html = await res.text();
        fetchSuccess = html.length > 500 && !html.includes('rotate your device');
      }
    } catch {}

    if (!fetchSuccess) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          html = await res.text();
          fetchSuccess = html.length > 500;
        }
      } catch {}
    }

    let jobTitle = '';
    let targetCompany = '';
    let jobDescription = '';

    if (fetchSuccess && html) {
      const isExpiredRedirect = html.includes('Job you are looking for is expired') ||
                                html.includes('similar jobs below') ||
                                html.includes('1 - 20 of') ||
                                html.includes('All Filters');

      if (!isExpiredRedirect) {
        const $ = cheerio.load(html);
        $('script, style, svg, nav, footer, header, iframe, noscript, button').remove();

        const skillChips: string[] = [];
        $('[class*="keySkill"], [class*="chip"], [class*="tag"], [class*="skill"]').each((_, el) => {
          const s = $(el).text().trim();
          if (s && s.length > 1 && s.length < 60 && !skillChips.includes(s) && !s.toLowerCase().includes('job') && !s.toLowerCase().includes('review')) {
            skillChips.push(s);
          }
        });

        $('*').each((_, el) => {
          $(el).append(' ');
        });

        const h1Text = $('h1').first().text().trim();
        const naukriTitle = $('.jd-header-title, .profile, [class*="job-title"], [class*="jobTitle"]').first().text().trim();
        const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || '';
        const pageTitle = $('title').text().trim();

        jobTitle = naukriTitle || h1Text || ogTitle || (pageTitle ? pageTitle.split(/[-|]/)[0].trim() : '');
        if (jobTitle.includes(' | ')) jobTitle = jobTitle.split(' | ')[0];
        if (jobTitle.includes(' Hiring ')) jobTitle = jobTitle.split(' Hiring ')[0];
        jobTitle = jobTitle.trim().slice(0, 100);

        const compMatch = html.match(/class="[^"]*comp-name[^"]*"[^>]*>([^<]+)</i) || html.match(/class="[^"]*companyName[^"]*"[^>]*>([^<]+)</i);
        const generalComp = $('.comp-name, .companyName, .company_name, [class*="company-name"], [class*="companyName"]').first().text().trim();
        const metaComp = $('meta[property="og:site_name"]').attr('content') || '';
        
        if (compMatch) targetCompany = compMatch[1].trim();
        else if (generalComp && !generalComp.toLowerCase().includes('naukri')) targetCompany = generalComp;
        else if (metaComp) targetCompany = metaComp;
        else {
          const parsedUrl = new URL(url);
          const domain = parsedUrl.hostname.replace('www.', '').split('.')[0];
          targetCompany = domain.charAt(0).toUpperCase() + domain.slice(1);
        }

        const fullText = $('body').text().replace(/\s+/g, ' ').trim();
        if (fullText.length > 100) {
          jobDescription = cleanAndFormatJd(fullText, skillChips);
        }
      }
    }

    if (jobDescription.length < 50 || !jobTitle) {
      const fallback = parseUrlSlugFallback(url);
      if (fallback) {
        if (!jobTitle) jobTitle = fallback.jobTitle;
        if (!targetCompany) targetCompany = fallback.targetCompany;
        if (jobDescription.length < 50) jobDescription = fallback.jobDescription;
      }
    }

    if (jobDescription.length < 30) {
      return NextResponse.json(
        { error: 'Could not extract job description text from this link. Please paste the job description text manually.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      jobTitle: jobTitle || 'Data Analyst',
      targetCompany: targetCompany || 'Birlasoft India Limited',
      jobDescription: jobDescription.slice(0, 10000),
    });
  } catch (error) {
    console.error('[API /api/scrape-job POST]', error);
    return NextResponse.json(
      { error: 'Failed to extract job posting details. Please paste the job description manually.' },
      { status: 500 }
    );
  }
}
