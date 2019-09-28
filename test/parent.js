"use strict";

const expect = require("expect");
const webidl2 = require("../dist/webidl2");

function checkParent(data) {
  if (data.extAttrs && data.extAttrs.length) {
    expect(data.extAttrs.parent).toBe(data);
    for (const extAttr of data.extAttrs) {
      expect(extAttr.parent).toBe(data.extAttrs);
      checkParent(extAttr);
    }
  }
  switch (data.type) {
    case "interface":
    case "namespace":
    case "callback interface":
    case "interface mixin":
    case "dictionary": {
      for (const member of data.members) {
        expect(member.parent).toBe(data);
        checkParent(member);
      }
      break;
    }
    case "constructor":
    case "operation":
    case "callback":
    case "extended-attribute": {
      for (const member of data.arguments) {
        expect(member.parent).toBe(data);
        checkParent(member);
      }
      break;
    }
    case "field":
    case "argument": {
      if (data.default) {
        expect(data.default.parent).toBe(data);
      }
      break;
    }
  }
}

describe("", () => {
  it("`parent` field should point to the parent", () => {
    const idl = `
      interface X {
        constructor();
        constructor(short s, long l);
        void foo();
        void foo(DOMString str, object obj);
        void bar(optional Dict dict = {});
        attribute Identifier i;
        iterable<DOMString>;
        setlike<DOMString>; // invalid but okay to parse
        maplike<DOMString, DOMString>;
      };

      namespace Y {
        void foo();
        void foo(DOMString str, object obj);
        readonly attribute Identifier i;
      };

      interface mixin Z {
        void foo();
        void foo(DOMString str, object obj);
        attribute Identifier i;
      };

      callback interface W {
        void foo();
        void foo(DOMString str, object obj);
      };

      dictionary Dict {
        required Type requiredField;
        Type? optionalField = null;
      };
    `;
    const tree = webidl2.parse(idl);
    for (const item of tree) {
      checkParent(item);
    }
  });
});
