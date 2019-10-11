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
      return super.update(
        {},
        {
          fixture: () => ({
            id: 1,
            name: 'Craig'
          })
        }
      );
    }

    static destroy() {
      return super.destroy(
        {},
        {
          fixture: () => ({
            status: 'bye!'
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

  test('destroy()', assert => {
    const done = assert.async();
    assert.expect(3);

    class Destroy extends Person {
      static id = 'name';
      static destroy(model) {
        assert.ok(true, 'called by destroy()');

        return super.destroy(model);
      }
    }

    const model = new Destroy({ name: 'Alan' });
    const promise = model.destroy().then(res => {
      assert.equal(res.status, 'bye!', 'chains with JSON response');

      done();
    });

    assert.ok(promise instanceof Promise, 'returns a Promise');
  });

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
