require 'rubygems'
require 'sinatra'

Sinatra::Base.set(:run, false)
Sinatra::Base.set(:env, ENV['RACK_ENV'] || "production")

#require 'rack/pagespeed'
require 'mapping_for_results'

use Rack::MethodOverride
use Rack::Session::Cookie
# , :key => 'rack.session',
#                            :httponly => true,
#                            :secure => true,
#                            :expire_after => 2592000, # In seconds
#                            :secret => 'geoiqmapsFTW'

# Sinatra::Base.set(:sessions, true)
                           
#use Rack::PageSpeed, :public => "public" do
#  # store :disk => "public" #Dir.tmpdir # require 'tmpdir'
#  inline_javascripts :max_size => 4000
#  inline_css
#  combine_javascripts
#end

run MappingForResults
