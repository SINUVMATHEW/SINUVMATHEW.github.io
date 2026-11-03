// Grouped from the skills list supplied by Sinu from LinkedIn.
export const skillGroups = [
  {
    title: 'AI & intelligent systems',
    note: 'Building with models, prompts and orchestration.',
    skills: [
      'Artificial Intelligence (AI)',
      'Large Language Models (LLM)',
      'LangChain'
    ]
  },
  {
    title: 'Backend & data',
    note: 'APIs, services and the systems behind them.',
    skills: [
      'FastAPI',
      'Node.js',
      'Express.js',
      'ASP.NET Core',
      '.NET Core',
      'ASP.NET MVC',
      'C#',
      'C (Programming Language)',
      'Apache Kafka',
      'Cassandra'
    ]
  },
  {
    title: 'Frontend & mobile',
    note: 'Interfaces that work across screens.',
    skills: [
      'React.js',
      'Web Design',
      'UI Testing',
      'Flutter',
      'Dart',
      'Android Development'
    ]
  },
  {
    title: 'Cloud & workflow',
    note: 'Platforms and tools for delivery.',
    skills: [
      'Amazon Web Services (AWS)',
      'Google Cloud Platform (GCP)',
      'Cloud',
      'Cloud Storage',
      'Cloud Applications',
      'Git',
      'Bitbucket',
      'Jira',
      'Confluence'
    ]
  },
  {
    title: 'Design & motion',
    note: 'From first sketch to finished visual.',
    skills: [
      'User Interface Design',
      'User Experience Design (UED)',
      'User Interface Prototyping',
      'Figma (Software)',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe Premiere Pro',
      'After Effects',
      'Gif Animator',
      'Studio Photography',
      'White board'
    ]
  },
  {
    title: 'Communication & delivery',
    note: 'Turning ideas into work people can share.',
    skills: [
      'Project Management',
      'Social Media Outreach',
      'Social Media Marketing',
      'YouTube'
    ]
  }
];

export const skillCount = skillGroups.reduce((total, group) => total + group.skills.length, 0);
