// Copyright 2014 TIS inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//= require ./modal_dialog

(function() {
  "use strict";

  App.Components.NetworkRoutes = App.Components.ModalDialog.extend({
    template: JST['editors/network_routes'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "network_routes";
      options.left = 800;
      options.top = 700;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.network_routes");

      this._super(options);

      this.$el.addClass("network-routes");

      this.editor = options.editor;
      this.network = options.network;

      this.routes = [];
      _.each(this.editor.graph.getElements(), function(cell) {
        if(cell.get('type') !== 'cc.Router') { return; }
        this.routes = this.routes.concat(cell.get('routes'));
      }, this);
    },

    render: function() {
      this.$el.html(this.template(this.network));

      //  select系の値を画面に反映
      var routes = this.network.get('routes');
      _.each(_.filter(routes, function(route) { return route; }), function(route, index) {
        this.$('.reference select').eq(index).val(route.id);
      }, this);

      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'input, select', this.onchange);

      this._super();

      this.$el.on('dialogclose', _.bind(function() {
        this.$el.dialog('destroy');
        this.$el.remove();
      }, this));
    },

    onchange: function(e) {
      var target = $(e.target);

      var tr = target.parents('tr');
      var trs = tr.parent().find('tr');
      var index = _.indexOf(trs, tr[0]);

      var routes = this.network.get('routes');
      if(index >= routes.length) {
        routes.push({});
        var row = this.$("tr:last");
        row.find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_network_routes_new'));
      }

      var route = _.find(this.routes, function(route) { return route.id === target.val(); });
      routes[index] = route;

      this.editor.refreshXml();
    },

    onremove: function(e) {
      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var routes = this.network.get('routes');
      routes.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index + 1) + ')').remove();

      this.editor.refreshXml();
    }
  });

})();
