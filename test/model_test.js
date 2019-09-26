import Model from '../model/model';
import '../dom/fixture/fixture.js';
import { module, test, todo } from 'qunit/qunit/qunit.js';

module('Model', () => {
  class Person extends Model {
    constructor(attrs) {
      super(attrs);

      this.id = attrs.id;
      this.name = attrs.name;
    }

    static findOne() {
      return super.findOne(
        {},
        {
          fixture: () => ({
            id: 1,
            name: 'Alan'
          })
        }
      );
    }

    static findAll() {
      return super.findAll(
        {},
        {
          fixture: () => [
            {
              id: 1,
              name: 'Alan'
            },
            {
              id: 2,
              name: 'Craig'
            }
          ]
        }
      );
    }

    static create() {
      return super.create(
        {},
        {
          fixture: () => ({
            id: 5
          })
        }
      );
    }

    static update() {
      return super.create(
        {},
        {
          fixture: () => ({
            id: 1,
            name: 'Craig'
          })
        }
      );
    }
  }

  module('names and namespaces', () => {
    class MetaPerson extends Model {}
    class Alan extends Model {
      static namespace = 'People';
    }
    class AlanBurgoyne extends Model {
      static namespace = 'People';
    }
    test('simple', assert => {
      assert.equal(Person.namespace, '', 'namespace');
      assert.equal(Person.fullName, 'Person', 'fullName');
      assert.equal(Person._fullName, 'person', '_fullName');
      assert.equal(Person.shortName, 'Person', 'shortName');
      assert.equal(Person._shortName, 'person', '_shortName');
    });

    test('CamelCase', assert => {
      assert.equal(MetaPerson.namespace, '', 'namespace');
      assert.equal(MetaPerson.fullName, 'MetaPerson', 'fullName');
      assert.equal(MetaPerson._fullName, 'meta_person', '_fullName');
      assert.equal(MetaPerson.shortName, 'MetaPerson', 'shortName');
      assert.equal(MetaPerson._shortName, 'meta_person', '_shortName');
    });

    test('Namespaced simple', assert => {
      assert.equal(Alan.namespace, 'People', 'namespace');
      assert.equal(Alan.fullName, 'People.Alan', 'fullName');
      assert.equal(Alan._fullName, 'people.alan', '_fullName');
      assert.equal(Alan.shortName, 'Alan', 'shortName');
      assert.equal(Alan._shortName, 'alan', '_shortName');
    });

    test('Namespaced CamelCase', assert => {
      assert.equal(AlanBurgoyne.namespace, 'People', 'namespace');
      assert.equal(AlanBurgoyne.fullName, 'People.AlanBurgoyne', 'fullName');
      assert.equal(AlanBurgoyne._fullName, 'people.alan_burgoyne', '_fullName');
      assert.equal(AlanBurgoyne.shortName, 'AlanBurgoyne', 'shortName');
      assert.equal(AlanBurgoyne._shortName, 'alan_burgoyne', '_shortName');
    });
  });

  test('new()', assert => {
    const model = new Person({});

    assert.ok(model instanceof Person, 'returns an instance');
    assert.ok(model instanceof Model, 'inherits from Model');
  });

  module('models()', assert => {});

  module('save() magic methods', () => {
    class Foo extends Model {
      constructor(attrs) {
        super(attrs);

        this.id = attrs.id;
        this.foo = attrs.foo;
      }
    }

    test('create()', assert => {
      const done = assert.async();
      assert.expect(7);

      class Bar extends Foo {
        static create(model) {
          assert.ok(!model[Bar.id], 'called by save() for new instance');
          assert.ok(model instanceof Bar, 'is passed the model instance');

          return super.create(model.serialize(), {
            fixture: () => ({ foo: 'bar', id: 1 })
          });
        }
      }

      assert.equal(Bar.id, 'id', 'default identity is `id`');

      const bar = new Bar({ foo: 'bar' });
      const promise = bar.save().then(model => {
        assert.ok(
          model instanceof Bar,
          'promise resolves with a model instance'
        );
        assert.equal(1, model.id, 'is assigned an id');
        assert.equal('bar', model.foo, 'retains its attrs');

        done();
      });

      assert.ok(promise instanceof Promise, 'returns a Promise');
    });

    test('update()', assert => {
      const done = assert.async();
      assert.expect(7);

      class Baz extends Foo {
        static update(model) {
          assert.ok(model[Baz.id], 'called by save() for existing instance');
          assert.ok(model instanceof Baz, 'is passed the model instance');

          return super.update(model.serialize(), {
            fixture: () => ({ foo: 'baz', id: 1 })
          });
        }
      }

      assert.equal(Baz.id, 'id', 'identity is `id`');

      const baz = new Baz({ foo: 'bar', id: 1 });
      const promise = baz.save().then(model => {
        assert.ok(
          model instanceof Baz,
          'promise resolves with a model instance'
        );
        assert.equal(1, model.id, 'retains its identity value');
        assert.equal('baz', model.foo, 'gets new attrs');

        done();
      });

      assert.ok(promise instanceof Promise, 'returns a Promise');
    });
  });

  todo('destroy()', assert => {});

  module('findOne()', () => {
    test('returns a promise', assert => {
      assert.expect(1);

      const promise = Model.findOne(
        {},
        {
          fixture: () => ({})
        }
      );
      assert.ok(promise instanceof Promise);
    });

    test('extend', assert => {
      const done = assert.async();

      assert.expect(3);

      Person.findOne().then(function(person) {
        assert.ok(person instanceof Person, 'resolves with an instance');
        assert.equal(person.id, 1, 'with the expected id');
        assert.equal(person.name, 'Alan', 'and the expected name');

        done();
      });
    });
  });
  module('findAll()', () => {
    test('returns a promise', assert => {
      assert.expect(1);

      const promise = Model.findAll(
        {},
        {
          fixture: () => []
        }
      );
      assert.ok(promise instanceof Promise);
    });

    test('extend', assert => {
      const done = assert.async();

      assert.expect(3);

      Person.findAll().then(function(people) {
        assert.equal(people.length, 2, 'returns a list or array');
        assert.ok(people[0] instanceof Person, 'containing instances');
        assert.equal(people[0].name, 'Alan', 'with the expected attrs');

        done();
      });
    });
  });
});

// test('destroy deferred', function(assert) {
//   const done = assert.async();

//   $.Model.extend(
//     'Person',
//     {
//       destroy: function(id, success, error) {
//         return $.ajax({
//           url: '/people/' + id,
//           type: 'post',
//           dataType: 'json',
//           fixture: function() {
//             return [{ thing: 'er' }];
//           },
//           success: success
//         });
//       }
//     },
//     {}
//   );

//   new Person({ name: 'Justin', id: 5 }).destroy().then(function(person) {
//     assert.equal(person.thing, 'er', 'we got destroyed');

//     done();
//   });
// });

// test('hookup and model', function(assert) {
//   var div = $('<div/>');
//   var p = new Person({ foo: 'bar2', id: 5 });

//   p.hookup(div[0]);

//   assert.ok(div.hasClass('person'), 'has person');
//   assert.ok(div.hasClass('person_5'), 'has person_5');
//   assert.equal(p, div.model(), 'gets model');
// });

// // test that models returns an array of unique instances
// test('unique models', function(assert) {
//   var div1 = $('<div/>');
//   var div2 = $('<div/>');
//   var div3 = $('<div/>');
//   var p = new Person({ foo: 'bar2', id: 5 });
//   var p2 = new Person({ foo: 'bar3', id: 4 });
//   p.hookup(div1[0]);
//   p.hookup(div2[0]);
//   p2.hookup(div3[0]);
//   var models = div1
//     .add(div2)
//     .add(div3)
//     .models();
//   assert.equal(p, models[0], 'gets models');
//   assert.equal(p2, models[1], 'gets models');
//   assert.equal(2, models.length, 'gets models');
// });

// test('models', function(assert) {
//   var people = Person.models([{ id: 1, name: 'Justin' }]);

//   assert.equal(people[0].prettyName(), 'Mr. Justin', 'wraps wrapping works');
// });

// // test('async setters', function(assert) {
// /*
// 	$.Model.extend("Test.AsyncModel",{
// 		setName : function(newVal, success, error){

// 			setTimeout(function(){
// 				success(newVal)
// 			}, 100)
// 		}
// 	});

// 	var model = new Test.AsyncModel({
// 		name : "justin"
// 	});
// 	assert.equal(model.name, "justin","property set right away")

// 	//makes model think it is no longer new
// 	model.id = 1;

// 	var count = 0;

// 	model.bind('name', function(ev, newName){
// 		assert.equal(newName, "Brian",'new name');
// 		assert.equal(++count, 1, "called once");
// 		assert.ok(new Date() - now > 0, "time passed")
// 		start();
// 	})
// 	var now = new Date();
// 	model.attr('name',"Brian");
// 	stop();*/
// // });

// test('binding', function(assert) {
//   assert.expect(2);

//   var inst = new Person({ foo: 'bar' });

//   inst.bind('foo', function(ev, val) {
//     assert.ok(true, 'updated');
//     assert.equal(val, 'baz', 'values match');
//   });

//   inst.attr('foo', 'baz');
// });

// test('error binding', function(assert) {
//   assert.expect(1);

//   $.Model.extend('School', {
//     setName: function(name, success, error) {
//       if (!name) {
//         error('no name');
//       }
//       return error;
//     }
//   });
//   var school = new School();
//   school.bind('error.name', function(ev, error) {
//     assert.equal(error, 'no name', 'error message provided');
//   });
//   school.attr('name', '');
// });

// test('auto methods', function(assert) {
//   // Method not allowed error when running via http-server
//   return assert.ok(1);

//   const done = assert.async();

//   assert.expect(6);

//   // Disable fixtures
//   $.fixture.on = false;

//   const School = $.Model.extend(
//     'School',
//     {
//       findAll: 'test/model/fixtures/{type}.json',
//       findOne: 'test/model/fixtures/{id}.json',
//       create: 'test/model/fixtures/create.json',
//       update: 'POST test/model/fixtures/update{id}.json'
//     },
//     {}
//   );

//   School.findAll({ type: 'schools' }, function(schools) {
//     assert.ok(schools, 'findAll Got some data back');
//     assert.equal(
//       schools[0].constructor.shortName,
//       'School',
//       'there are schools'
//     );

//     School.findOne({ id: '4' }, function(school) {
//       assert.ok(school, 'findOne Got some data back');
//       assert.equal(school.constructor.shortName, 'School', 'a single school');

//       new School({ name: 'Highland' }).save(function() {
//         assert.equal(this.name, 'Highland', 'create gets the right name');

//         this.update({ name: 'LHS' }, function() {
//           assert.equal(this.name, 'LHS', 'create gets the right name');

//           $.fixture.on = true;

//           done();
//         });
//       });
//     });
//   });
// });

// test('isNew', function(assert) {
//   var p = new Person();
//   assert.ok(p.isNew(), 'nothing provided is new');

//   var p2 = new Person({ id: null });
//   assert.ok(p2.isNew(), 'null id is new');

//   var p3 = new Person({ id: 0 });
//   assert.ok(!p3.isNew(), '0 is not new');
// });

// test('findAll string', function(assert) {
//   const done = assert.async();

//   assert.expect(2);

//   $.fixture.on = false;

//   $.Model.extend(
//     'Test.Thing',
//     {
//       findAll: 'test/model/fixtures/findAll.json'
//     },
//     {}
//   );

//   Test.Thing.findAll({}, function(things) {
//     assert.equal(things.length, 1, 'got an array');
//     assert.equal(things[0].id, 1, 'an array of things');

//     $.fixture.on = true;

//     done();
//   });
// });

// test('Empty uses fixtures', function(assert) {
//   const done = assert.async();

//   assert.expect(1);

//   $.Model.extend('Test.Thing');

//   $.fixture.make('thing', 10, function(i) {
//     return {
//       id: i
//     };
//   });

//   Test.Thing.findAll({}, function(things) {
//     assert.equal(things.length, 10, 'got 10 things');

//     done();
//   });
// });

// test('Model events', function(assert) {
//   const done = assert.async();

//   assert.expect(8);

//   let order = 0;
//   let item;

//   $.Model.extend(
//     'Test.Event',
//     {
//       create: function(attrs, success) {
//         success({ id: 1 });
//       },
//       update: function(id, attrs, success) {
//         success(attrs);
//       },
//       destroy: function(id, success) {
//         success();
//       }
//     },
//     {}
//   );

//   $([Test.Event])
//     .bind('created', function(ev, instance) {
//       assert.ok(this === Test.Event, 'got model');
//       assert.equal(++order, 1, 'order');

//       item = instance;

//       instance.update({});
//     })
//     .bind('updated', function(ev, instance) {
//       assert.equal(++order, 2, 'order');
//       assert.ok(this === Test.Event, 'got model');
//       assert.ok(instance === item, 'got instance');

//       instance.destroy({});
//     })
//     .bind('destroyed', function(ev, instance) {
//       assert.equal(++order, 3, 'order');
//       assert.ok(this === Test.Event, 'got model');
//       assert.ok(instance === item, 'got instance');

//       done();
//     });

//   new Test.Event().save();
// });

// test('converters and serializes', function(assert) {
//   $.Model.extend(
//     'Task1',
//     {
//       attributes: {
//         createdAt: 'date'
//       },
//       convert: {
//         date: function(d) {
//           var months = ['jan', 'feb', 'mar'];
//           return months[d.getMonth()];
//         }
//       },
//       serialize: {
//         date: function(d) {
//           var months = { jan: 0, feb: 1, mar: 2 };
//           return months[d];
//         }
//       }
//     },
//     {}
//   );
//   $.Model.extend(
//     'Task2',
//     {
//       attributes: {
//         createdAt: 'date'
//       },
//       convert: {
//         date: function(d) {
//           var months = ['apr', 'may', 'jun'];
//           return months[d.getMonth()];
//         }
//       },
//       serialize: {
//         date: function(d) {
//           var months = { apr: 0, may: 1, jun: 2 };
//           return months[d];
//         }
//       }
//     },
//     {}
//   );
//   var d = new Date();
//   d.setDate(1);
//   d.setMonth(1);
//   var task1 = new Task1({
//     createdAt: d,
//     name: 'Task1'
//   });
//   d.setMonth(2);
//   var task2 = new Task2({
//     createdAt: d,
//     name: 'Task2'
//   });
//   assert.equal(task1.createdAt, 'feb', 'Task1 model convert');
//   assert.equal(task2.createdAt, 'jun', 'Task2 model convert');
//   assert.equal(task1.serialize().createdAt, 1, 'Task1 model serialize');
//   assert.equal(task2.serialize().createdAt, 2, 'Task2 model serialize');
//   assert.equal(
//     task1.serialize().name,
//     'Task1',
//     'Task1 model default serialized'
//   );
//   assert.equal(
//     task2.serialize().name,
//     'Task2',
//     'Task2 model default serialized'
//   );
// });

// test('default converters', function(assert) {
//   var num = 1318541064012;
//   assert.equal(
//     $.Model.convert.date(num).getTime(),
//     num,
//     'converted to a date with a number'
//   );
// });

// test('removeAttr test', function(assert) {
//   var person = new Person({ foo: 'bar' });
//   assert.equal(person.foo, 'bar', 'property set');
//   person.removeAttr('foo');

//   assert.equal(person.foo, undefined, 'property removed');
//   var attrs = person.attrs();
//   assert.equal(attrs.foo, undefined, 'attrs removed');
// });

// test('identity should replace spaces with underscores', function(assert) {
//   $.Model.extend('Task', {}, {});

//   const t = new Task({
//     id: 'id with spaces'
//   });

//   assert.equal(t.identity(), 'task_id_with_spaces');
// });

// test('save error args', function(assert) {
//   const done = assert.async();

//   assert.expect(2);

//   var Foo = $.Model.extend(
//     'Testin.Models.Foo',
//     {
//       create: '/testinmodelsfoos.json'
//     },
//     {}
//   );
//   var st = '{type: "unauthorized"}';

//   $.fixture('/testinmodelsfoos.json', function() {
//     return [401, st];
//   });

//   var inst = new Foo({}).save(
//     function() {
//       assert.ok(false, 'success should not be called');
//     },
//     function(jQXHR) {
//       assert.ok(true, 'error called');
//       assert.ok(jQXHR.getResponseHeader, 'jQXHR object');

//       done();
//     }
//   );
// });

// test('hookup and elements', function(assert) {
//   $.Model.extend(
//     'Escaper',
//     {
//       escapeIdentity: true
//     },
//     {}
//   );

//   var ul = $('<ul><li></li></ul>'),
//     li = ul.find('li');

//   var esc = new Escaper({ id: ' some crazy #/ %ing stuff' });

//   li.model(esc);

//   var res = esc.elements(ul);

//   assert.equal(res.length, 1, '1 item');
//   assert.ok(res[0] === li[0], 'items are equal');
// });

// test('aborting create update and destroy', function(assert) {
//   const done = assert.async();
//   const delay = $.fixture.delay;

//   assert.expect(3);

//   $.fixture.delay = 1000;

//   $.fixture('POST /abort', function() {
//     assert.ok(false, 'we should not be calling the fixture');

//     return {};
//   });

//   $.Model.extend(
//     'Abortion',
//     {
//       create: 'POST /abort',
//       update: 'POST /abort',
//       destroy: 'POST /abort'
//     },
//     {}
//   );

//   var deferred = new Abortion({ name: 'foo' }).save(
//     function() {
//       assert.ok(false, 'success create');
//     },
//     function() {
//       assert.ok(true, 'create error called');

//       deferred = new Abortion({ name: 'foo', id: 5 }).save(
//         function() {},
//         function() {
//           assert.ok(true, 'error called in update');

//           deferred = new Abortion({ name: 'foo', id: 5 }).destroy(
//             function() {},
//             function() {
//               assert.ok(true, 'destroy error called');

//               $.fixture.delay = delay;

//               done();
//             }
//           );

//           setTimeout(function() {
//             deferred.abort();
//           }, 10);
//         }
//       );

//       setTimeout(function() {
//         deferred.abort();
//       }, 10);
//     }
//   );
//   setTimeout(function() {
//     deferred.abort();
//   }, 10);
// });

// test('object definitions', function(assert) {
//   const done = assert.async();

//   assert.expect(1);

//   $.Model.extend(
//     'ObjectDef',
//     {
//       findAll: {
//         url: '/test/place'
//       },
//       findOne: {
//         url: '/objectdef/{id}',
//         timeout: 1000
//       },
//       create: {},
//       update: {},
//       destroy: {}
//     },
//     {}
//   );

//   $.fixture('GET /objectdef/{id}', function(original) {
//     assert.equal(original.timeout, 1000, 'timeout set');

//     return { yes: true };
//   });

//   ObjectDef.findOne({ id: 5 }, function() {
//     done();
//   });
// });
