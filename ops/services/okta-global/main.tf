// Create the required simple report scope

data "okta_auth_server" "default" {
  name = "default"
}

// We need to import and manage the pdi scope as well.
// So we can remove it later

resource "okta_auth_server_scope" "sr" {
  auth_server_id = data.okta_auth_server.default.id
  name = "simple_report"
  description = "Default OAUTH scope for Simple Report application"
  metadata_publish = "NO_CLIENTS"
  default = false
}

// Add the required claims
resource "okta_auth_server_claim" "sr_user" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "org"
  value = "appuser.pdi_org"
  scopes = [
    okta_auth_server_scope.sr.name]
}

resource "okta_auth_server_claim" "sr_org" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "access"
  value = "appuser.pdi_user"
  scopes = [
    okta_auth_server_scope.sr.name]
}

resource "okta_auth_server_claim" "family_name" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "family_name"
  value = "user.lastName"
}

resource "okta_auth_server_claim" "given_name" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "given_name"
  value = "user.firstName"
}

resource "okta_auth_server_claim" "groups" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "groups"
  value_type = "GROUPS"
  group_filter_type = "REGEX"
  value = ".*"
  scopes = [
    okta_auth_server_scope.sr.name]
}

resource "okta_auth_server_claim" "tenant_groups" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "tenant_groups"
  value_type = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value = "TENANT-MEMBERS:"
  scopes = [
    okta_auth_server_scope.sr.name]
}

resource "okta_auth_server_claim" "is_tenant_admin" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "is_tenant_admin"
  value_type = "EXPRESSION"
  value = "isMemberOfGroupName(\"TENANT-ADMINS\")"
  scopes = [
    okta_auth_server_scope.sr.name]
}

resource "okta_auth_server_claim" "is_simplereport_admin" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "is_simplereport_admin"
  value_type = "EXPRESSION"
  value = "isMemberOfGroupName(\"Prime SimpleReport Admins\")"
  scopes = [
    okta_auth_server_scope.sr.name]
}

// Create the CDC/USDS user groups
resource "okta_group" "prime_users" {
  name = "Prime Team Members"
  description = "All Prime team members"
}

resource "okta_group" "prime_simplereport_admins" {
  name = "Prime SimpleReport Admins"
  description = "Application Administrators for SimpleReport"
}
