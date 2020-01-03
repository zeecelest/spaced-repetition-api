class Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(value) {
    this.head = new Node(value, this.head);
  }

  insertLast(value) {
    if (this.head === null) {
      this.insertFirst(value);
    } else {
      let last = this.head;
      while (last.next !== null) {
        last = last.next;
      }
      last.next = new Node(value, null);
    }
  }

  insertAfter(value, insertion) {
    let currNode = this.find(insertion);
    let afterNode = currNode.next;
    currNode.next = new Node(value, afterNode);
  }

  insertBefore(value, insertion) {
    let currNode = this.head;
    let tempNode = this.head;
    while (currNode.value !== insertion) {
      tempNode = currNode;
      currNode = currNode.next;
    }
    tempNode.next = new Node(value, currNode);
  }

  insertAt(value, index) {
    if (index > this.size()) {
      value.next = null;
      this.insertLast(value);
    } else {
      let currIndex = 0;
      let currNode = this.head;
      while (currIndex !== (index) && currNode.next !== null) {
        currNode = currNode.next;
        currIndex++;
      }
      currNode.value.next = value.id;
      value.next = currNode.next.value.id;
      currNode.next = new Node(value, currNode.next);
    }
  }

  find(item) {
    let currNode = this.head;
    if (!this.head) {
      return null;
    }
    while (currNode.value !== item) {
      if (currNode.next === null) {
        return null;
      } else {
        currNode = currNode.next;
      }
    }
    return currNode;
  }

  remove(item) {
    if (!this.head) {
      return null;
    }
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    let currNode = this.head;
    let previousNode = this.head;
    while ((currNode !== null) && (currNode.value !== item)) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      return;
    }
    previousNode.next = currNode.next;
  }

  display() {
    let currNode = this.head;
    let str = '';
    while (currNode.next !== null) {
      str = str + currNode.value.original + ', ';
      currNode = currNode.next;
    }
    str = str + currNode.value.original;
  }

  size() {
    let size = 0;
    let currNode = this.head;
    while (currNode !== null) {
      size++;
      currNode = currNode.next;
    }
    return size;
  }

  isEmpty() {
    return this.head === null;
  }

  findPrevious(value) {
    let currNode = this.head;
    if (currNode === null) {
      return 'empty list';
    } else {
      let tempNode = currNode;
      while (currNode.value !== value) {
        if (currNode.next === null) {
          return 'no such value';
        } else {
          tempNode = currNode;
          currNode = currNode.next;
        }
      }
      return tempNode;
    }
  }

  findLast() {
    let currNode = this.head;
    if (currNode === null) {
      return 'empty list';
    } else {
      while (currNode.next !== null) {
        currNode = currNode.next;
      }
      return currNode;
    }
  }
}

module.exports = LinkedList;