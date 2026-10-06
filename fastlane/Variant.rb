# fastlane/Variant.rb — the single APP_VARIANT resolver, shared by the Appfile
# and the Fastfile so signing identity and iOS scheme can never disagree.
#
# `app.config.ts` is the only source of native config truth (AD-23). This module
# does not duplicate its values by hand: the id suffix and the display name are
# mirrored here from the same three-profile table, and the iOS scheme is derived
# from the display name (Xcode strips the spaces). Change a display name in
# `app.config.ts` and the scheme follows, rather than silently targeting a
# nonexistent scheme.
module NightTrace
  BUNDLE_BASE = 'com.nighttrace.app'.freeze

  # Profiles differ ONLY in id suffix and display name (Deployment & environments).
  SUFFIX = { 'dev' => '.dev', 'preview' => '.preview', 'production' => '' }.freeze
  DISPLAY_NAME = {
    'dev' => 'NightTrace Dev',
    'preview' => 'NightTrace Preview',
    'production' => 'NightTrace'
  }.freeze

  # Resolve like app.config.ts: unset defaults to `dev` (never a production id),
  # but an unrecognised value is a hard error here — app.config.ts can fall back
  # to a name, whereas signing must never guess an identity.
  def self.variant
    raw = ENV['APP_VARIANT']
    return 'dev' if raw.nil? || raw.empty?

    unless SUFFIX.key?(raw)
      raise "APP_VARIANT=#{raw.inspect} is not one of dev | preview | production"
    end
    raw
  end

  def self.bundle_identifier
    "#{BUNDLE_BASE}#{SUFFIX.fetch(variant)}"
  end

  # Xcode scheme = display name with spaces removed (NightTraceDev / …).
  def self.ios_scheme
    DISPLAY_NAME.fetch(variant).gsub(/\s+/, '')
  end

  # Signing/submitting an unset variant would produce a dev binary; refuse it
  # rather than let a forgotten environment variable ship the wrong identity.
  def self.assert_variant_set!
    raw = ENV['APP_VARIANT']
    return unless raw.nil? || raw.empty?

    raise 'APP_VARIANT is not set. Refusing to sign or submit: an unset variant ' \
          'resolves to the dev identity (com.nighttrace.app.dev).'
  end
end
