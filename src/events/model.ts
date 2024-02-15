export type Metadata = {
  repo: string;
  owner: string;
  default_branch: string;
  html_url: string;
  pull_request: {
    ref: string;
    sha: string;
    title: string;
    author: string;
    number: number;
    labels: string[];
    updated_at: string;
    html_url: string;
  };
};
