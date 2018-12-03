import '../controller/controller.js';

const Tabs = $.Controller.extend('Tabs', {
  init: function() {
    this.element.children('li:first').addClass('active');
    var tab = this.tab;
    this.element.children('li:gt(0)').each(function() {
      tab($(this)).hide();
    });
  },
  tab: function(li) {
    return $(li.find('a').attr('href'));
  },
  'li click': function(el, ev) {
    ev.preventDefault();
    this.activate(el);
  },
  activate: function(el) {
    this.tab(this.find('.active').removeClass('active')).hide();
    this.tab(el.addClass('active')).show();
  }
});

//inherit from tabs
const HistoryTabs = Tabs.extend('HistoryTabs', {
  // ignore clicks
  'li click': function() {},

  // listen for history changes
  '{window} hashchange': function(ev) {
    var hash = window.location.hash;
    this.activate(
      hash === '' || hash === '#'
        ? this.element.find('li:first')
        : this.element.find('a[href="' + hash + '"]').parent()
    );
  }
});

//adds the controller to the element
$('#tabs').tabs();
$('#history-tabs').history_tabs();
