const fs = require('fs');
const content = fs.readFileSync('CampaignsView.vue', 'utf8');

const fixed = content.replace(
  /availableVersions\.value = response\.flatMap\(\(survey: any\) =>\s*survey\.versions \|\| \[\]\s*\)/,
  `availableVersions.value = response.flatMap((survey: any) => {
      return (survey.versions || []).map((version: any) => ({
        ...version,
        survey: { id: survey.id, title: survey.title }
      }))
    })`
);

fs.writeFileSync('CampaignsView.vue', fixed, 'utf8');
console.log('Fixed!');
