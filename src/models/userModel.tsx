export interface User {
   login:               string;
   id:                  number;
   email:               string;
   status:              boolean;
   age:                 number;
   node_id:             string;
   avatar_url:          string;
   gravatar_id:         string;
   url:                 string;
   html_url:            string;
   followers_url:       string;
   following_url:       string;
   gists_url:           string;
   starred_url:         string;
   subscriptions_url:   string;
   organizations_url:   string;
   repos_url:           string;
   events_url:          string;
   received_events_url: string;
   type:                Type;
   user_view_type:      UserViewType;
   site_admin:          boolean;
}

export enum Type {
   Organization = "Organization",
   User = "User",
}

export enum UserViewType {
   Public = "public",
}
