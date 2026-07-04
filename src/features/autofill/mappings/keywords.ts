/**
 * Keyword mappings for form field detection.
 * Maps field type keys to an array of matching search keywords/phrases.
 */

export interface FieldMapping {
  type: string;
  keywords: string[];
}

export const AUTOFILL_FIELD_MAPPINGS: FieldMapping[] = [
  {
    type: 'firstName',
    keywords: ['first name', 'given name', 'fname', 'first_name', 'first-name'],
  },
  {
    type: 'lastName',
    keywords: ['last name', 'surname', 'family name', 'lname', 'last_name', 'last-name'],
  },
  {
    type: 'fullName',
    keywords: ['full name', 'entire name', 'complete name', 'your name', 'name'],
  },
  {
    type: 'email',
    keywords: ['email', 'e-mail', 'mail address', 'email_address', 'email-address'],
  },
  {
    type: 'phone',
    keywords: ['phone', 'telephone', 'mobile', 'cell', 'contact number', 'phone_number', 'phone-number'],
  },
  {
    type: 'location',
    keywords: ['location', 'address', 'city', 'state', 'country', 'current residence', 'current address'],
  },
  {
    type: 'summary',
    keywords: ['summary', 'about', 'bio', 'personal statement', 'objective', 'about me'],
  },
  {
    type: 'linkedin',
    keywords: ['linkedin', 'linkedin url', 'linkedin profile', 'linkedin.com'],
  },
  {
    type: 'github',
    keywords: ['github', 'github url', 'github profile', 'github.com'],
  },
  {
    type: 'portfolio',
    keywords: ['portfolio', 'website', 'personal site', 'homepage', 'personal website', 'blog'],
  },
  {
    type: 'twitter',
    keywords: ['twitter', 'x.com', 'twitter profile', 'twitter url'],
  },
  {
    type: 'leetcode',
    keywords: ['leetcode', 'leetcode profile', 'leetcode url'],
  },
  {
    type: 'university',
    keywords: ['university', 'college', 'school', 'institute', 'institution', 'education place'],
  },
  {
    type: 'degree',
    keywords: ['degree', 'qualification', 'program of study'],
  },
  {
    type: 'fieldOfStudy',
    keywords: ['field of study', 'major', 'discipline', 'subject', 'specialization', 'course'],
  },
  {
    type: 'cgpa',
    keywords: ['gpa', 'cgpa', 'grade', 'marks', 'percentage', 'cumulative gpa', 'g.p.a.'],
  },
  {
    type: 'graduationYear',
    keywords: ['graduation year', 'grad year', 'year of graduation', 'completion year', 'graduation date'],
  },
  {
    type: 'whyHire',
    keywords: [
      'why should we hire you',
      'why should you be hired',
      'why are you a good fit',
      'why do you want this',
      'cover letter',
      'cover_letter',
      'cover-letter',
      'statement of purpose',
      'sop',
      'why this internship',
      'why this role',
      'why this job',
      'why should we select you',
      'why do you think we should hire you',
      'cover letter/statement of purpose'
    ],
  },
  {
    type: 'projectsDetail',
    keywords: [
      'project link',
      'projects link',
      'project website',
      'project url',
      'github link of project',
      'portfolio link',
      'deployed project',
      'work samples',
      'links to your work',
      'describe your projects',
      'details of projects',
      'project links',
      'links to project'
    ],
  },
];
