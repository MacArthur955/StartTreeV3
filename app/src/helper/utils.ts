export function insertAfter(newNode: Node, existingNode: Node) {
  existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling);
}
