export const get_complete_enabled_permisions = () => ({
  data_permissions: {
    can_export_company_data: true,
    can_import_company_data: true,
  },
  settings_permissions: {
    can_access_general_and_security_settings: true,
    can_manage_team_mates_and_permissions: true,
    can_access_widget_configuration: true,
    can_access_billing_settings: true,
    can_access_outbound_settings: true,
    can_edit_default_sender_address: true,
    can_manage_tags: true,
    can_manage_contacts: true,
    can_access_lead_and_user_profile_pages: true,
  },
  inbox_permissions: {
    can_access_general_and_security_settings: true,
    can_manage_team_mates_and_permissions: true,
    can_access_widget_configuration: true,
    can_access_billing_settings: true,
    can_access_outbound_settings: true,
    can_edit_default_sender_address: true,
    can_manage_tags: true,
    can_manage_contacts: true,
    can_access_lead_and_user_profile_pages: true,
  },
  article_permissions: {
    can_manage_articles: true,
  },
});
export const get_online_prescence_room_name = (id: string) =>
  `online-prescence-${id}`;

export const escape_regex = (string: string) => {
  if (string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
};

type Operator =
  | 'equals'
  | 'not_equal_to'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal_to'
  | 'less_than_or_equal_to';

export const translateOperatorIntoRegex = (
  operator: Operator,
  value: string,
) => {
  let response = value;

  switch (operator) {
    case 'contains':
      response = `.*${value}.*`;
      break;
    case 'equals':
    case 'greater_than':
    case 'greater_than_or_equal_to':
    case 'less_than_or_equal_to':
      response = `^${value}$`;
      break;
    case 'not_equal_to':
      response = `^((?!${value}).)*$`;
      break;
    default:
      response = value;
      break;
  }

  return response;
};
