import Controller from './controller';

declare global {
  interface JQuery {
    tabs(): JQuery;
  }
}

class Tabs extends Controller {
  static bindings = {
    'a:not(".active") click': function(el: JQuery, ev: any) {
      this.selectTab(el);
    }
  };

  init() {
    this.selectTab(this.element.find('ul li:first a'));
  }

  tabContent(a: JQuery) {
    return this.element.find(a.attr('href'));
  }

  selectTab(a: JQuery) {
    a.parent()
      .addClass('active')
      .siblings()
      .removeClass('active');

    this.tabContent(a)
      .show()
      .siblings('div')
      .hide();
  }
}

Tabs.registerPlugin();

$('#tabs').tabs();
