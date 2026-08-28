// Full Curriculum Data for All 3 Subjects with 5 Topics Each (15 Total Topics, 240 MCQs across 120 Levels)

import { CurriculumSubject } from './learningCurriculum.js';

export const ALL_CURRICULUM_SUBJECTS: CurriculumSubject[] = [
  // =========================================================================
  // SUBJECT 1: DATA STRUCTURES & ALGORITHMS (5 Complete Topics)
  // =========================================================================
  {
    name: 'Data Structures',
    code: 'data_structures',
    color: '#6366F1',
    icon: '💻',
    description: 'Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, AVL Trees, Graphs, BFS/DFS, and Dijkstra',
    topics: [
      // 1.1 Arrays
      {
        title: 'Arrays & Dynamic Arrays — Architecture & Complexity',
        topicName: 'Arrays & Dynamic Arrays',
        difficulty: 'EASY',
        transcript: `Topic: Arrays and Dynamic Arrays in Computer Science

1. Definition and Core Principle:
An array is a contiguous memory collection of fixed-size elements of homogeneous data type. Because memory is contiguous, any element can be directly accessed in O(1) constant time using the formula: Base Address + (Index * Element Size).

2. Detailed Explanation and Memory Architecture:
Static arrays require their capacity to be predetermined at compile or initialization time. If memory runs out, the array cannot grow in place. Dynamic arrays (like ArrayList in Java, std::vector in C++, and list in Python) resolve this by maintaining an underlying static array, a logical size, and an allocated capacity. When the logical size reaches capacity, the dynamic array allocates a new buffer of 2x capacity, copies all existing n elements over in O(n) time, and deallocates the old buffer.

3. Time and Space Complexity Breakdown:
- Random Access by Index: O(1) time
- Append at End (Amortized): O(1) time (Worst-case single insertion is O(n) during resizing)
- Insertion at Index 0: O(n) time (requires shifting all n items to the right)
- Deletion at Index 0: O(n) time (requires shifting all n items to the left)
- Search in Unsorted Array: O(n) linear scan
- Space Complexity: O(n) contiguous heap/stack space

4. Real-World Applications:
- Frame buffers in graphics hardware and display rendering
- Lookup tables and fixed-size cache registries
- Underlying storage engine for Matrix algebra, image pixels, and hash table buckets

5. Advantages and Limitations:
- Advantages: O(1) direct memory indexing, cache friendliness with spatial locality, minimal memory overhead per element.
- Limitations: Expensive insertion/deletion in the middle due to memory shifts, fixed capacity in static arrays, memory reallocation overhead in dynamic arrays.

6. Common Mistakes & Exam Traps:
- Confusing worst-case insertion O(n) with amortized insertion O(1).
- Out-of-bounds index errors (Off-by-one errors in 0-indexed systems).
- Assuming arrays can resize without creating a new contiguous buffer.

7. Quick Revision Summary:
Arrays provide unmatched O(1) random access via contiguous memory calculation. Geometric capacity doubling guarantees amortized O(1) insertions for dynamic arrays.

8. Verified Educational References:
- Cormen, Leiserson, Rivest, Stein (CLRS), "Introduction to Algorithms", 4th Edition, Chapter 10.
- MIT OpenCourseWare 6.006: Introduction to Algorithms, Lecture 2 (Data Structures and Dynamic Arrays).`,
        summary: 'Arrays store data contiguously for O(1) random indexing. Dynamic arrays use 2x geometric resizing to achieve amortized O(1) appends.',
        bullets: [
          'Direct index calculation: Base Address + (Index * Element Size) gives O(1) access',
          'Static arrays have fixed memory boundaries; dynamic arrays double capacity on overflow',
          'Amortized insertion time is O(1) over a sequence of N append operations',
          'Insertions and deletions at index 0 require O(n) element shifts',
          'Contiguous layout maximizes CPU L1/L2 cache line hits through spatial locality',
          'CLRS Reference: Chapter 10 elementary data structures and dynamic tables'
        ],
        keywords: [
          { term: 'Contiguous Memory', definition: 'Sequential adjacent physical memory addresses without gaps.', importance: 5 },
          { term: 'Amortized Time', definition: 'Average time per operation over a worst-case sequence of operations.', importance: 5 },
          { term: 'Spatial Locality', definition: 'CPU caching benefit where reading one address pre-loads neighboring addresses.', importance: 4 },
          { term: 'Capacity Doubling', definition: 'Geometric growth strategy allocating 2x buffer when full.', importance: 4 }
        ],
        flashcards: [
          { front: 'What is the formula for calculating memory address in an array?', back: 'Base Address + (Index * Element Size)', hint: 'Think of contiguous offset arithmetic.' },
          { front: 'Why is dynamic array append amortized O(1) instead of O(n)?', back: 'Because the expensive O(n) doubling happens exponentially less often as the array grows.', hint: 'Consider aggregate analysis across N insertions.' }
        ],
        quizzes: [
          { question: 'What is the primary architectural requirement that allows arrays to achieve O(1) random access?', options: ['Elements are linked via pointers', 'Memory is allocated contiguously in physical address space', 'Elements are pre-sorted in ascending order', 'The array is stored inside CPU registers only'], correct: 1, explanation: 'Contiguous memory layout allows the CPU to calculate any element address instantly using base address plus index offset.', hint: 'Think about adjacent memory slots.', level: 1, difficulty: 'easy' },
          { question: 'In a 0-indexed array with base address 1000 and 4-byte integers, what is the memory address of the element at index 3?', options: ['1003', '1004', '1012', '1016'], correct: 2, explanation: 'Address = 1000 + (3 * 4) = 1012. Base plus index multiplied by data size.', hint: 'Multiply index by bytes per element, add to base.', level: 1, difficulty: 'easy' },
          { question: 'What is the worst-case time complexity of inserting an item at the beginning (index 0) of a static array of size n?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 2, explanation: 'Inserting at index 0 requires shifting all n existing elements one position to the right, taking O(n) operations.', hint: 'Every single existing element must move.', level: 2, difficulty: 'easy' },
          { question: 'Which standard library container is an example of a dynamic array?', options: ['std::list in C++', 'std::vector in C++', 'LinkedList in Java', 'TreeSet in Java'], correct: 1, explanation: 'std::vector in C++ and ArrayList in Java are canonical implementations of dynamic arrays.', hint: 'Look for resizable vector container.', level: 2, difficulty: 'easy' },
          { question: 'When a dynamic array exceeds its capacity, what resizing strategy maintains amortized O(1) append time?', options: ['Increment capacity by +1 element', 'Double the capacity (2x geometric growth)', 'Square the capacity (n²)', 'Divide capacity in half'], correct: 1, explanation: 'Geometric doubling (2x) ensures total copying work across N insertions sums to less than 2N, giving amortized O(1) cost.', hint: 'Geometric growth avoids O(n²) total time.', level: 3, difficulty: 'medium' },
          { question: 'Why do arrays have superior cache performance compared to linked lists?', options: ['Arrays use smaller memory pointers per node', 'Contiguous memory layout exhibits strong spatial locality for CPU caches', 'Arrays do not use RAM', 'Arrays run on GPU cores exclusively'], correct: 1, explanation: 'CPUs load memory in 64-byte cache lines; reading an array element pre-fetches neighboring elements into cache.', hint: 'Hardware pre-fetchers read adjacent blocks.', level: 3, difficulty: 'medium' },
          { question: 'If a dynamic array starts with capacity 1 and doubles when full, how many element copies occur while inserting 9 elements?', options: ['8 copies', '15 copies', '20 copies', '36 copies'], correct: 1, explanation: 'Resizes occur on element 2 (1 copy), 3 (2 copies), 5 (4 copies), and 9 (8 copies). Total copies = 1 + 2 + 4 + 8 = 15.', hint: 'Sum powers of 2 for each resize up to 9th insert.', level: 4, difficulty: 'medium' },
          { question: 'What is the time complexity of finding the maximum element in an unsorted array of n integers?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 2, explanation: 'Without order, every element must be inspected at least once, requiring O(n) linear scans.', hint: 'Cannot skip elements without prior ordering.', level: 4, difficulty: 'medium' },
          { question: 'Suppose you need to frequently insert elements at index 0 and rarely access elements by random index. Which data structure is best?', options: ['Dynamic Array', 'Singly Linked List', 'Static Array', 'Binary Heap'], correct: 1, explanation: 'A linked list can insert at head in O(1) without shifting, whereas an array takes O(n) shifts.', hint: 'Updates a pointer without shifting memory.', level: 5, difficulty: 'medium' },
          { question: 'What happens to existing pointers or references to array elements when a dynamic array resizes?', options: ['They remain valid and update automatically', 'They become invalid (dangling pointers) because memory was reallocated elsewhere', 'They are promoted to register variables', 'They are converted to hash keys'], correct: 1, explanation: 'Reallocation creates a new heap block and frees the old one, invalidating all raw pointers to old elements.', hint: 'Old buffer is deallocated after data is copied.', level: 5, difficulty: 'medium' },
          { question: 'In a real-time audio application requiring guaranteed latency under 1ms per sample, why is a dynamic array risky?', options: ['Array indexing is non-deterministic', 'Occasional O(n) resize pauses violate hard real-time latency bounds', 'Arrays consume too much CPU power', 'Audio samples cannot be stored in numbers'], correct: 1, explanation: 'Worst-case single resize operations take O(n), causing unpredictable audio buffer underrun latency spikes.', hint: 'Difference between average and worst-case single operation.', level: 6, difficulty: 'medium' },
          { question: 'What is the space overhead of a dynamic array of capacity C holding N elements (where C > N)?', options: ['O(1) extra space', 'O(C - N) unused allocated memory slots', 'O(N²)', 'Zero extra space'], correct: 1, explanation: 'The unused allocated capacity (C - N) remains reserved in memory until elements fill it or shrink-to-fit is called.', hint: 'Unused pre-allocated empty slots.', level: 6, difficulty: 'medium' },
          { question: 'If a dynamic array shrinks capacity by half whenever N == Capacity / 2, what problem occurs under alternating inserts and deletes?', options: ['Memory fragmentation deadlock', 'Thrashing: O(n) resize on every single alternating operation', 'Stack overflow', 'Pointer corruption'], correct: 1, explanation: 'Alternating insert and delete at the boundary triggers repeated 2x allocations and half-size deallocations in O(n) each step.', hint: 'Crossing boundary back and forth forces continuous reallocations.', level: 7, difficulty: 'hard' },
          { question: 'How does multidimensional array indexing work in Row-Major order for array A[R][C] with base B and element size S?', options: ['B + (row + col) * S', 'B + (row * C + col) * S', 'B + (col * R + row) * S', 'B + (row * col) * S'], correct: 1, explanation: 'In Row-Major order (C, C++, Python numpy), entire rows are stored sequentially: Address = B + (row * C + col) * S.', hint: 'Each row contains C elements to skip.', level: 7, difficulty: 'hard' },
          { question: 'Using the Accounting Method for dynamic array doubling, what is the minimum amortized charge per append to pay for all future copies?', options: ['1 credit', '2 credits', '3 credits', 'N credits'], correct: 2, explanation: 'Charge 3 credits: 1 pays immediate insert, 1 saves for this element moving later, 1 saves for an older element moving later.', hint: 'CLRS dynamic table proof charges 3 credits.', level: 8, difficulty: 'hard' },
          { question: 'Which memory constraint prevents a static array from extending into adjacent memory when full?', options: ['OS file locks', 'Adjacent memory addresses may already be allocated to other variables or heap blocks', 'CPU register limits', 'Garbage collection cycle freezes'], correct: 1, explanation: 'Because memory beyond the array bound may belong to other variables or stack frames, growth must occur in a completely new contiguous block.', hint: 'Memory allocators protect adjacent allocations.', level: 8, difficulty: 'hard' }
        ]
      },

      // 1.2 Linked Lists
      {
        title: 'Linked Lists & Doubly Linked Lists — Pointer Dynamics',
        topicName: 'Linked Lists & Doubly Linked Lists',
        difficulty: 'EASY',
        transcript: `Topic: Singly and Doubly Linked Lists in Computer Science

1. Definition and Core Principles:
A linked list is a linear data structure consisting of discrete nodes connected sequentially via pointer references. Unlike arrays, nodes are not stored in contiguous memory; each node contains a data payload and one or more pointer references to adjacent nodes.

2. Node Architectures:
- Singly Linked List: Each node contains 'data' and a 'next' pointer. Traversal is unidirectional from head to null.
- Doubly Linked List (DLL): Each node contains 'data', a 'next' pointer, and a 'prev' pointer. Enables bidirectional traversal and O(1) removal of any node given its direct reference.
- Circular Linked List: The tail node points back to the head node instead of null.

3. Time and Space Complexity:
- Prepend (Insert at Head): O(1) time
- Append (with Tail Pointer): O(1) time
- Search by Value: O(n) sequential traversal
- Access by Index k: O(k) <= O(n) traversal
- Delete Node (Given pointer in DLL): O(1) pointer reconfiguration
- Space Overhead: O(n) extra pointer fields (4 to 8 bytes per pointer per node)

4. Real-World Applications:
- Implementation of LRU (Least Recently Used) cache (combined with Hash Map)
- Undo/Redo operation stacks in text editors and graphic software
- Operating system free memory block management (freelist)
- Browser back and forward button navigation

5. Advantages and Limitations:
- Advantages: Dynamic size adjustment without reallocating large contiguous blocks, O(1) insertion/deletion at known node positions, zero wasted pre-allocated buffer slots.
- Limitations: No O(1) random access by index, extra memory overhead for pointers, poor cache locality due to scattered heap node allocations.

6. Common Mistakes & Edge Cases:
- Dereferencing null pointers (e.g., node.next.next when node.next is null).
- Losing head reference during node insertion or reversal.
- Memory leaks in non-garbage-collected languages (C/C++) from failing to free unlinked nodes.

7. Quick Revision Summary:
Linked lists provide dynamic memory flexibility and O(1) insertions/deletions at known positions at the expense of random access and CPU cache locality.

8. Verified Educational References:
- Cormen et al. (CLRS), "Introduction to Algorithms", 4th Edition, Section 10.2.
- Sedgewick & Wayne, "Algorithms", 4th Edition, Section 1.3 (Bags, Queues, and Stacks).`,
        summary: 'Linked lists link individual heap nodes with pointers, offering O(1) insertions and deletions at known positions without memory shifting.',
        bullets: [
          'Singly linked list nodes store data and a single next pointer',
          'Doubly linked list nodes store data, next, and previous pointers for bidirectional navigation',
          'Inserting or deleting at head takes O(1) pointer updates',
          'Accessing element at index k requires O(k) sequential node hops',
          'DLL combined with a hash table powers the O(1) LRU cache architecture',
          'Scattered heap allocations cause CPU cache misses relative to contiguous arrays'
        ],
        keywords: [
          { term: 'Node', definition: 'Basic structural unit containing data value and pointer references.', importance: 5 },
          { term: 'Doubly Linked List', definition: 'List where each node links to both successor and predecessor.', importance: 5 },
          { term: 'Head Pointer', definition: 'Pointer reference to the first node of the list.', importance: 4 },
          { term: 'Sentinel Node', definition: 'Dummy node used to simplify boundary condition edge cases.', importance: 4 }
        ],
        flashcards: [
          { front: 'How does deleting a node in a Doubly Linked List take O(1) time?', back: 'By updating node.prev.next = node.next and node.next.prev = node.prev directly without searching.', hint: 'Use both prev and next pointers.' },
          { front: 'Why cannot binary search be executed efficiently on a linked list?', back: 'Because finding the middle element requires O(n) sequential traversal instead of O(1) indexing.', hint: 'Binary search requires instant middle element access.' }
        ],
        quizzes: [
          { question: 'What two components constitute a basic node in a Singly Linked List?', options: ['Key and Hash code', 'Data payload and Next pointer reference', 'Array index and Value', 'Left child and Right child'], correct: 1, explanation: 'A singly linked list node contains the stored data payload and a pointer/reference to the next node.', hint: 'Data and link to next element.', level: 1, difficulty: 'easy' },
          { question: 'What is the value of the next pointer in the final node of a non-circular linked list?', options: ['0', 'Null / None', 'Pointer to head', '-1'], correct: 1, explanation: 'The terminal node in a standard linear linked list points to Null / None to signify the end of the sequence.', hint: 'Terminates when no next element exists.', level: 1, difficulty: 'easy' },
          { question: 'What is the time complexity to insert a new node at the very beginning (head) of a linked list?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 0, explanation: 'Setting newNode.next = head and head = newNode takes O(1) constant time with zero element shifting.', hint: 'Only two pointer assignments at head.', level: 2, difficulty: 'easy' },
          { question: 'Which type of linked list allows traversing both forward and backward through elements?', options: ['Singly linked list', 'Doubly linked list', 'Array list', 'Binary search tree'], correct: 1, explanation: 'Doubly linked lists contain both next and previous pointers, permitting two-way traversal.', hint: 'Dual directional links.', level: 2, difficulty: 'easy' },
          { question: 'What is the primary reason Binary Search cannot be performed in O(log n) on a singly linked list?', options: ['Linked lists cannot store sorted values', 'Finding the middle element requires O(n) linear steps because there is no direct indexing', 'Linked lists use too much CPU cache', 'Linked lists only store strings'], correct: 1, explanation: 'Without O(1) random access, locating the middle element in a linked list requires stepping through n/2 pointers in O(n) time.', hint: 'Locating middle takes linear steps.', level: 3, difficulty: 'medium' },
          { question: 'To delete a target node in a Singly Linked List, which reference is strictly required?', options: ['The target node only', 'The node immediately preceding the target node (previous node)', 'The tail node', 'The length of the list'], correct: 1, explanation: 'In a singly linked list, prev.next must be updated to target.next. Without the predecessor, the incoming pointer cannot be changed.', hint: 'Must redirect incoming pointer.', level: 3, difficulty: 'medium' },
          { question: 'In a Doubly Linked List, how do you disconnect node X given pointers to X, X.prev, and X.next?', options: ['X.prev = X.next', 'X.prev.next = X.next; X.next.prev = X.prev;', 'X.next = null; X.prev = null;', 'head = X.next;'], correct: 1, explanation: 'Updating X.prev.next to bypass X and X.next.prev to bypass X completely removes X from the chain in O(1) time.', hint: 'Connect predecessor to successor both ways.', level: 4, difficulty: 'medium' },
          { question: 'What algorithm detects a cycle in a linked list using O(1) auxiliary space?', options: ['Dijkstra algorithm', 'Floyd Cycle-Finding (Tortoise and Hare) algorithm', 'Binary Search', 'Kruskal algorithm'], correct: 1, explanation: 'Floyd cycle detection uses a slow pointer moving 1 step and a fast pointer moving 2 steps; they meet if and only if a cycle exists.', hint: 'Slow and fast pointer collision.', level: 4, difficulty: 'medium' },
          { question: 'What is the purpose of using a Sentinel (Dummy) node at the head of a linked list?', options: ['To speed up CPU clock frequency', 'To eliminate special-case edge handling when inserting or deleting the head node', 'To reduce memory consumption to zero', 'To sort the list automatically'], correct: 1, explanation: 'A dummy head ensures that the target node always has a valid preceding node, removing boilerplate null checks for the head.', hint: 'Avoids head null checks.', level: 5, difficulty: 'medium' },
          { question: 'Which data structure combination allows an LRU Cache to achieve O(1) get() and O(1) put() operations?', options: ['Array and Stack', 'Hash Map and Doubly Linked List', 'Binary Search Tree and Queue', 'Min-Heap and Matrix'], correct: 1, explanation: 'The Hash Map provides O(1) node lookup by key, and the Doubly Linked List provides O(1) node removal and moving to the head.', hint: 'Instant lookup plus instant node re-ordering.', level: 5, difficulty: 'medium' },
          { question: 'In a 64-bit operating system, what is the pointer memory overhead of a Doubly Linked List node storing a 4-byte integer?', options: ['4 bytes', '8 bytes', '16 bytes (8 bytes for next + 8 bytes for prev)', '64 bytes'], correct: 2, explanation: 'On 64-bit systems, each memory address pointer is 8 bytes. Two pointers (next and prev) equal 16 bytes of overhead for 4 bytes of payload.', hint: '2 pointers * 8 bytes each.', level: 6, difficulty: 'medium' },
          { question: 'How do you reverse a Singly Linked List iteratively in O(n) time and O(1) space?', options: ['Swap values between first and last node', 'Maintain three pointers (prev, curr, next) and reverse pointers one by one', 'Create a new array and copy values', 'Use recursive tail recursion only'], correct: 1, explanation: 'Iteratively storing next = curr.next, setting curr.next = prev, and advancing prev and curr reverses the list in-place.', hint: 'Track previous, current, and saved next.', level: 6, difficulty: 'medium' },
          { question: 'In a circular singly linked list with only a tail pointer, what is the time complexity to insert at both head and tail?', options: ['O(n) for both', 'O(1) for both', 'O(1) for head, O(n) for tail', 'O(n) for head, O(1) for tail'], correct: 1, explanation: 'Because tail.next is the head, inserting at head is tail.next = newNode in O(1), and inserting at tail is the same followed by tail = newNode in O(1).', hint: 'Tail pointer accesses head via tail.next.', level: 7, difficulty: 'hard' },
          { question: 'What is an Unrolled Linked List and what major problem does it solve?', options: ['A list that cannot be reversed', 'A linked list where each node holds a small array of elements to dramatically improve CPU cache locality', 'A list with no pointer fields', 'A circular stack'], correct: 1, explanation: 'Unrolled linked lists store multiple elements in each node array, reducing pointer memory overhead and boosting cache line utilization.', hint: 'Node arrays boosting cache efficiency.', level: 7, difficulty: 'hard' },
          { question: 'What is the time complexity of finding the k-th node from the end of a singly linked list in a single pass?', options: ['O(n²) time and O(n) space', 'O(n) time and O(1) auxiliary space using two pointers separated by k steps', 'O(log n) time', 'O(k) time without reading list'], correct: 1, explanation: 'Advancing a first pointer k steps ahead, then moving both pointers at equal speed until the first reaches the end finds the k-th last node in one pass.', hint: 'Fixed gap of k steps between pointers.', level: 8, difficulty: 'hard' },
          { question: 'Why does memory fragmentation occur more frequently with high-churn linked lists compared to dynamic arrays in C/C++?', options: ['Arrays do not use virtual memory', 'Frequent allocation and deallocation of small individual node chunks scatters heap pages', 'Linked lists lock memory pages', 'Linked lists bypass kernel malloc'], correct: 1, explanation: 'Allocating millions of individual small node structs across heap addresses leads to external memory fragmentation and cache thrashing.', hint: 'Scattered small heap allocations.', level: 8, difficulty: 'hard' }
        ]
      },

      // 1.3 Stacks & Queues
      {
        title: 'Stacks, Queues & Priority Queues — Structural Mechanics',
        topicName: 'Stacks & Queues',
        difficulty: 'MEDIUM',
        transcript: `Topic: Stacks, Queues, and Priority Queues in Computer Science

1. Stacks (LIFO - Last In, First Out):
A stack is an abstract data type enforcing strict LIFO discipline. Elements are inserted (pushed) and removed (popped) exclusively from one end called the Top.
- Operations: push(x) in O(1), pop() in O(1), peek() in O(1), isEmpty() in O(1).
- Applications: Execution call stack in compilers and interpreters, parentheses matching, syntax parsing, backtracking in DFS, browser undo history.

2. Queues (FIFO - First In, First Out):
A queue enforces FIFO order. Elements are inserted at the Rear (enqueue) and extracted from the Front (dequeue).
- Operations: enqueue(x) in O(1), dequeue() in O(1), front() in O(1).
- Circular Queue: Uses modulo arithmetic (index = (index + 1) % Capacity) to wrap around fixed-size arrays without shifting elements.
- Applications: CPU process scheduling, asynchronous print buffers, Breadth-First Search (BFS) graph traversal.

3. Priority Queues & Binary Heaps:
A Priority Queue serves elements based on priority rather than arrival time. Standard implementations use a Binary Heap:
- peek(): O(1) root access
- push(x) / insert: O(log n) sift-up
- pop() / extract-min: O(log n) sift-down

4. Complexity Comparison:
- Stack push/pop: O(1) time, O(n) space
- Queue enqueue/dequeue: O(1) time, O(n) space
- Priority Queue insert/extract: O(log n) time, O(n) space

5. Verified Educational References:
- CLRS, "Introduction to Algorithms", 4th Edition, Section 10.1 (Stacks and Queues) and Chapter 6 (Heapsort).
- Sedgewick & Wayne, "Algorithms", 4th Edition, Section 2.4 (Priority Queues).`,
        summary: 'Stacks enforce LIFO for recursion and parsing. Queues enforce FIFO for scheduling and BFS. Priority Queues use binary heaps for O(log n) min/max retrieval.',
        bullets: [
          'Stack: LIFO discipline with O(1) push, pop, and top operations',
          'Queue: FIFO discipline with O(1) enqueue at rear and dequeue at front',
          'Circular Queue uses (rear + 1) % capacity to reuse vacated buffer slots',
          'Priority Queue implemented with Binary Heap gives O(log n) insert and extract-min',
          'Call stack frames store function parameters, local variables, and return addresses',
          'BFS uses a Queue; DFS and backtracking use a Stack'
        ],
        keywords: [
          { term: 'LIFO', definition: 'Last In, First Out operational rule used by stacks.', importance: 5 },
          { term: 'FIFO', definition: 'First In, First Out operational rule used by queues.', importance: 5 },
          { term: 'Circular Buffer', definition: 'Array-based queue wrapping indices using modulo arithmetic.', importance: 4 },
          { term: 'Binary Heap', definition: 'Complete binary tree satisfying the heap-order property.', importance: 5 }
        ],
        flashcards: [
          { front: 'Which data structure evaluates arithmetic postfix (Reverse Polish) expressions?', back: 'A Stack, pushing operands and popping two operands upon encountering an operator.', hint: 'LIFO operand reduction.' },
          { front: 'What is the mathematical condition for a circular array queue of capacity N to be full?', back: '(rear + 1) % N == front', hint: 'Next rear slot collides with front.' }
        ],
        quizzes: [
          { question: 'Which principle governs the insertion and extraction order in a standard Stack?', options: ['First In, First Out (FIFO)', 'Last In, First Out (LIFO)', 'Shortest Job First', 'Random Access'], correct: 1, explanation: 'Stacks enforce Last In, First Out (LIFO), meaning the most recently pushed item is the first one popped.', hint: 'Cafeteria trays stack.', level: 1, difficulty: 'easy' },
          { question: 'Which principle governs the order of operations in a standard Queue?', options: ['Last In, First Out (LIFO)', 'First In, First Out (FIFO)', 'Priority In, Priority Out', 'Highest Memory First'], correct: 1, explanation: 'Queues enforce First In, First Out (FIFO), processing elements in the exact order of their arrival.', hint: 'Store checkout line.', level: 1, difficulty: 'easy' },
          { question: 'What is the time complexity of push and pop operations on an array-backed stack with top index tracking?', options: ['O(1) constant time', 'O(n) linear time', 'O(log n)', 'O(n²)'], correct: 0, explanation: 'Push and pop only increment or decrement the top index pointer and read/write that single slot in O(1) time.', hint: 'Only top element accessed.', level: 2, difficulty: 'easy' },
          { question: 'Which traversal algorithm for graphs and trees fundamentally uses a Queue?', options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'In-Order Traversal', 'Topological Sort with DFS'], correct: 1, explanation: 'BFS explores vertices level by level, placing newly discovered neighbors at the rear of a FIFO Queue.', hint: 'Level by level exploration.', level: 2, difficulty: 'easy' },
          { question: 'When evaluating the postfix expression "5 3 + 2 *", what is the final result computed using a Stack?', options: ['11', '16', '13', '21'], correct: 1, explanation: 'Push 5, push 3. Encounter "+": pop 3 and 5, push 5+3=8. Push 2. Encounter "*": pop 2 and 8, push 8*2=16.', hint: '(5 + 3) * 2.', level: 3, difficulty: 'medium' },
          { question: 'Why does a naive array implementation of a queue suffer from O(n) dequeue time if elements are not shifted?', options: ['Arrays cannot store pointers', 'Removing the front element at index 0 leaves an empty slot unless all elements shift left', 'Memory is corrupted', 'Stack overflow occurs'], correct: 1, explanation: 'If the front is fixed at index 0, removing an element requires shifting all remaining n elements left, taking O(n) time.', hint: 'Shifting remaining elements takes linear time.', level: 3, difficulty: 'medium' },
          { question: 'How does a Circular Queue eliminate the O(n) shifting penalty in array-based queues?', options: ['By allocating a new array on every push', 'By using modulo arithmetic to wrap front and rear indices around array boundaries', 'By converting the array to a binary search tree', 'By deleting half the elements'], correct: 1, explanation: 'Modulo indexing (index = (index + 1) % Capacity) allows front and rear to advance continuously in O(1) without shifting.', hint: 'Wrap around to index 0.', level: 4, difficulty: 'medium' },
          { question: 'What is the time complexity to insert an element into a Binary Heap-based Priority Queue of size n?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 1, explanation: 'Inserting into a binary heap places the element at the next leaf and sifts up along the tree height of log2(n).', hint: 'Logarithmic tree height.', level: 4, difficulty: 'medium' },
          { question: 'How can a Queue be implemented using two Stacks (Inbox and Outbox)?', options: ['Push to Inbox; on dequeue, if Outbox is empty, pop all from Inbox to Outbox and pop from Outbox', 'Alternate pushing between the two stacks', 'Store elements in both stacks simultaneously', 'Sort both stacks after every operation'], correct: 0, explanation: 'Pouring elements from Inbox to Outbox reverses their order twice, turning LIFO into FIFO with amortized O(1) cost per operation.', hint: 'Two reversals restore FIFO order.', level: 5, difficulty: 'medium' },
          { question: 'Which problem is solved efficiently using a Monotonic Stack in O(n) total time?', options: ['Shortest Path in Weighted Graph', 'Next Greater Element for every item in an array', 'Matrix Multiplication', 'K-Means Clustering'], correct: 1, explanation: 'A monotonic stack maintains elements in sorted order, resolving the Next Greater Element problem in a single O(n) pass.', hint: 'Elements entered/exited at most once.', level: 5, difficulty: 'medium' },
          { question: 'What occurs when a recursive function calls itself indefinitely without reaching a terminating base case?', options: ['Heap fragmentation', 'Call Stack Overflow (exceeding memory allocated for execution stack frames)', 'Queue starvation', 'Deadlock'], correct: 1, explanation: 'Each function invocation pushes a new stack frame containing registers and local variables; infinite recursion exhausts call stack memory.', hint: 'Call stack runs out of memory.', level: 6, difficulty: 'medium' },
          { question: 'In an Operating System print spooler where documents must print in the exact order received, which data structure is most appropriate?', options: ['Stack', 'FIFO Queue', 'Min-Heap', 'Hash Table'], correct: 1, explanation: 'A FIFO queue ensures that the first print job submitted is the first print job processed by the physical printer.', hint: 'First-In-First-Out.', level: 6, difficulty: 'medium' },
          { question: 'In the Sliding Window Maximum problem of array size N with window size K, what data structure yields O(N) overall time complexity?', options: ['Max-Heap (yielding O(N log K))', 'Monotonic Double-Ended Queue (Deque) storing indices of potential maximums', 'Nested loops (yielding O(N*K))', 'Binary Search Tree'], correct: 1, explanation: 'A monotonic deque maintains indices of decreasing elements, inserting and removing each index at most once for O(N) total runtime.', hint: 'Deque enters and leaves indices at most once.', level: 7, difficulty: 'hard' },
          { question: 'In a complete Binary Min-Heap stored in an array at index i (1-indexed), what are the array indices of the parent, left child, and right child?', options: ['Parent: i-1, Left: i+1, Right: i+2', 'Parent: floor(i/2), Left: 2*i, Right: 2*i + 1', 'Parent: 2*i, Left: i/2, Right: i/2 + 1', 'Parent: i, Left: i*i, Right: i*i + 1'], correct: 1, explanation: 'For a 1-indexed heap array: parent is at floor(i/2), left child is at 2*i, and right child is at 2*i + 1.', hint: 'Children double parent; parent halves child.', level: 7, difficulty: 'hard' },
          { question: 'Why is building a binary heap of N elements using Bottom-Up Floyd Heapify O(N) instead of O(N log N)?', options: ['Because it uses multithreading', 'Because the majority of nodes are near the leaves where required sift-down height is small (sum of h/2^h converges to 2)', 'Because comparisons are skipped', 'Because memory is contiguous'], correct: 1, explanation: 'Half the nodes are leaves (height 0), a quarter have height 1, an eighth have height 2. The geometric series sum(h / 2^h) converges to 2, proving O(N) linear time.', hint: 'Most nodes have very short sift paths.', level: 8, difficulty: 'hard' },
          { question: 'In lock-free concurrent programming, how is the ABA Problem mitigated when implementing lock-free stacks using Compare-And-Swap (CAS)?', options: ['By disabling CPU interrupts', 'By attaching a version/generation counter tag to the top pointer (Tagged Pointers)', 'By using recursive mutexes', 'By clearing the stack after each pop'], correct: 1, explanation: 'Tagged pointers pair the address with a monotonic modification counter, ensuring CAS fails if a node was popped, reused, and pushed back.', hint: 'Version counter with pointer.', level: 8, difficulty: 'hard' }
        ]
      },

      // 1.4 Binary Search Trees & AVL
      {
        title: 'Binary Search Trees & Balanced AVL Trees — Hierarchical Search',
        topicName: 'Binary Search Trees & AVL Trees',
        difficulty: 'MEDIUM',
        transcript: `Topic: Binary Search Trees and Self-Balancing AVL Trees

1. Binary Search Tree (BST) Properties:
A BST is a binary tree where for every node N:
- All keys in the left subtree are strictly less than N.key.
- All keys in the right subtree are strictly greater than N.key.
- Both left and right subtrees must also be valid BSTs.
- In-Order Traversal (Left, Root, Right) always produces keys in strictly ascending sorted order.

2. Operations and Degenerate Worst-Case:
- Balanced BST Search / Insert / Delete: O(log n) time
- Degenerate (Skewed) BST: If elements are inserted in already-sorted order (e.g., 1, 2, 3, 4, 5), the tree degrades into a linear linked list with O(n) height and O(n) operations.

3. AVL Trees (Self-Balancing BST):
An AVL tree maintains the strict balance invariant that for every node:
- Balance Factor = Height(Left Subtree) - Height(Right Subtree) must be in {-1, 0, +1}.
- If |Balance Factor| >= 2, the tree performs rotations in O(1) time to restore balance.

4. AVL Rotations:
- Left-Left (LL): Single Right Rotation.
- Right-Right (RR): Single Left Rotation.
- Left-Right (LR): Left Rotation on Left Child, then Right Rotation on Node.
- Right-Left (RL): Right Rotation on Right Child, then Left Rotation on Node.

5. Complexity Comparison:
- AVL Height Bound: Strictly <= 1.44 * log2(n)
- Search, Insertion, Deletion: O(log n) guaranteed

6. Verified Educational References:
- CLRS, "Introduction to Algorithms", 4th Edition, Chapter 12 (BSTs) and Chapter 13 (Red-Black Trees).
- Knuth, "The Art of Computer Programming", Vol 3: Sorting and Searching.`,
        summary: 'BSTs order keys for logarithmic search. AVL trees enforce a balance factor in {-1, 0, +1} using rotations, guaranteeing strict O(log n) operations.',
        bullets: [
          'BST Property: Left subtree keys < Node key < Right subtree keys',
          'In-Order traversal (Left -> Node -> Right) visits keys in sorted ascending order',
          'Unbalanced BSTs degrade to O(n) height on sorted inputs',
          'AVL balance factor = Height(Left) - Height(Right) strictly bounded to {-1, 0, +1}',
          'Four rotation cases (LL, RR, LR, RL) restore balance in O(1) pointer updates',
          'Deleting a two-child node requires swapping with its In-Order Successor'
        ],
        keywords: [
          { term: 'Binary Search Tree', definition: 'Binary tree where left children are smaller and right children are larger.', importance: 5 },
          { term: 'Balance Factor', definition: 'Height difference between left and right subtrees.', importance: 5 },
          { term: 'In-Order Successor', definition: 'Node with the smallest key in the right subtree.', importance: 4 },
          { term: 'Tree Rotation', definition: 'O(1) pointer restructuring operation preserving in-order key sequence.', importance: 5 }
        ],
        flashcards: [
          { front: 'What tree traversal on a BST yields keys in strictly ascending sorted order?', back: 'In-Order Traversal (Left, Root, Right).', hint: 'Traverse left, visit root, traverse right.' },
          { front: 'What rotation sequence fixes a Left-Right (LR) imbalance in an AVL tree?', back: 'Left rotation on the left child, followed by a Right rotation on the unbalanced root node.', hint: 'Double rotation.' }
        ],
        quizzes: [
          { question: 'Which fundamental property defines a Binary Search Tree (BST)?', options: ['All nodes must have exactly two children', 'Left subtree keys < Node key < Right subtree keys', 'Parent key is always greater than both children', 'All leaf nodes are at the same depth'], correct: 1, explanation: 'In a BST, every node in the left subtree has a key smaller than the root, and right subtree keys are larger.', hint: 'Smaller left, larger right.', level: 1, difficulty: 'easy' },
          { question: 'Which tree traversal algorithm produces all BST keys in strictly sorted ascending order?', options: ['Pre-Order Traversal', 'In-Order Traversal', 'Post-Order Traversal', 'Level-Order Traversal'], correct: 1, explanation: 'In-Order traversal recursively visits Left subtree, then current Node, then Right subtree, producing keys in sorted order.', hint: 'Left, Root, Right.', level: 1, difficulty: 'easy' },
          { question: 'What is the worst-case time complexity of searching in a completely unbalanced (skewed) BST of n elements?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 2, explanation: 'Inserting sorted keys into an unbalancing BST creates a linear linked-list chain of height n, resulting in O(n) search time.', hint: 'Straight chain of height n.', level: 2, difficulty: 'easy' },
          { question: 'What is the valid range of the Balance Factor (Height_Left - Height_Right) for every node in an AVL tree?', options: ['Exactly 0', '{-1, 0, +1}', '{-2, -1, 0, 1, 2}', 'Any positive integer'], correct: 1, explanation: 'An AVL tree strictly requires that the height difference between left and right subtrees of every node is at most 1 (i.e. -1, 0, or +1).', hint: 'Height difference at most 1.', level: 2, difficulty: 'easy' },
          { question: 'When deleting a node that has TWO children in a BST, which node can replace it to preserve BST properties?', options: ['Any random leaf node', 'The In-Order Successor (smallest node in right subtree) or In-Order Predecessor', 'The tree root node', 'The left child node unconditionally'], correct: 1, explanation: 'The In-Order Successor is greater than all left subtree nodes and smaller than all remaining right subtree nodes, maintaining valid ordering.', hint: 'Next smallest in right subtree.', level: 3, difficulty: 'medium' },
          { question: 'Which rotation is required to rebalance an AVL node with a Balance Factor of +2 whose left child has a Balance Factor of +1 (Left-Left case)?', options: ['Single Left Rotation', 'Single Right Rotation', 'Left-Right Double Rotation', 'Right-Left Double Rotation'], correct: 1, explanation: 'A Left-Left heavy imbalance is resolved with a single Right Rotation around the unbalanced node.', hint: 'Single right rotation.', level: 3, difficulty: 'medium' },
          { question: 'Which sequence of rotations fixes a Left-Right (LR) imbalance where a node has balance +2 and its left child has balance -1?', options: ['Right rotation on root only', 'Left rotation on left child, followed by Right rotation on root', 'Right rotation on left child, followed by Left rotation on root', 'Two consecutive Left rotations on root'], correct: 1, explanation: 'An LR imbalance is first converted to an LL case via a Left Rotation on the left child, then rebalanced via a Right Rotation on the root.', hint: 'Rotate child left, parent right.', level: 4, difficulty: 'medium' },
          { question: 'What is the maximum height of an AVL tree containing n nodes?', options: ['O(1)', 'O(log2 n) (strictly bounded by ~1.44 * log2 n)', 'O(n)', 'O(n²)'], correct: 1, explanation: 'The strict AVL balance factor constraint guarantees that height never exceeds 1.44 * log2(n), ensuring O(log n) operations.', hint: 'Strictly logarithmic.', level: 4, difficulty: 'medium' },
          { question: 'If you insert keys [10, 20, 30] sequentially into an initially empty AVL tree, what is the root node after rebalancing?', options: ['10', '20', '30', 'Null'], correct: 1, explanation: 'Inserting 10, then 20, then 30 causes an RR imbalance at node 10. A single Left Rotation makes 20 the new root with children 10 and 30.', hint: 'Median value becomes root.', level: 5, difficulty: 'medium' },
          { question: 'What is the time complexity of finding the Minimum element in a valid Binary Search Tree of height h?', options: ['O(1)', 'O(h)', 'O(n log n)', 'O(h²)'], correct: 1, explanation: 'The minimum element is found by traversing left child pointers until reaching a node with no left child, taking O(h) steps.', hint: 'Follow leftmost path.', level: 5, difficulty: 'medium' },
          { question: 'How do AVL trees compare with Red-Black trees in terms of search vs insertion performance trade-offs?', options: ['AVL trees are faster for searching due to stricter balance; Red-Black trees are faster for frequent insertions/deletions with fewer rotations', 'Red-Black trees have strictly smaller height than AVL trees', 'AVL trees do not support deletions', 'They are mathematically identical'], correct: 0, explanation: 'AVL trees are more rigidly balanced, giving faster lookups. Red-Black trees allow slightly more height slack, reducing rotation overhead on writes.', hint: 'Stricter balance equals faster lookups.', level: 6, difficulty: 'medium' },
          { question: 'What is the Lowest Common Ancestor (LCA) of nodes with keys 3 and 8 in a BST with root key 6?', options: ['3', '6', '8', '14'], correct: 1, explanation: 'Since 3 < 6 and 8 > 6, the two nodes diverge at root 6. Therefore, node 6 is their Lowest Common Ancestor.', hint: 'The split point.', level: 6, difficulty: 'medium' },
          { question: 'What is the worst-case number of rotations required during a single node DELETION in an AVL tree?', options: ['At most 1 rotation', 'At most 2 rotations', 'O(log n) rotations (rebalancing can propagate up the entire root path)', 'O(n) rotations'], correct: 2, explanation: 'Unlike insertion (which terminates after at most 2 rotations), deletion can change subtree height and trigger rotations at every ancestor up to root.', hint: 'Cascades up to root.', level: 7, difficulty: 'hard' },
          { question: 'How can an Augmented BST find the k-th smallest element in O(log n) time?', options: ['By running an in-order scan', 'By storing the size (count of nodes) of the left subtree inside each node', 'By hashing all keys', 'By sorting pointers in an array'], correct: 1, explanation: 'Storing subtree size allows decision-making: if left_size == k - 1, current is k-th; if left_size >= k, go left; else go right for (k - left_size - 1).', hint: 'Store subtree sizes.', level: 7, difficulty: 'hard' },
          { question: 'Why are B-Trees or B+ Trees preferred over AVL Trees for database indexes on disk storage?', options: ['AVL trees cannot store integers', 'B-Trees have high fan-out (hundreds of keys per node), minimizing expensive disk block I/O seeks', 'AVL trees require too much RAM bandwidth', 'Disk hardware only understands B-Trees'], correct: 1, explanation: 'AVL trees are binary (fan-out 2), causing deep trees with many disk seeks. B-Trees match disk block sizes with high branching factor to keep height tiny (3-4 levels).', hint: 'High fan-out minimizes disk seeks.', level: 8, difficulty: 'hard' },
          { question: 'What is the recurrence relation for the minimum number of nodes N(h) in an AVL tree of height h?', options: ['N(h) = 2 * N(h - 1)', 'N(h) = N(h - 1) + N(h - 2) + 1 (Fibonacci-like recurrence)', 'N(h) = N(h / 2) + 1', 'N(h) = h²'], correct: 1, explanation: 'To minimize nodes at height h, one subtree has height h-1 and the other has height h-2: N(h) = N(h - 1) + N(h - 2) + 1, proving height is bounded by Fibonacci numbers.', hint: 'Fibonacci-like recurrence.', level: 8, difficulty: 'hard' }
        ]
      },

      // 1.5 Graphs & Dijkstra
      {
        title: 'Graph Algorithms — BFS, DFS & Dijkstra Shortest Path',
        topicName: 'Graph Algorithms & Dijkstra',
        difficulty: 'HARD',
        transcript: `Topic: Graph Algorithms, Traversal Strategies, and Dijkstra's Shortest Path

1. Graph Representation:
A graph G = (V, E) consists of vertices V and edges E (directed or undirected, weighted or unweighted).
- Adjacency Matrix: V x V 2D matrix. Provides O(1) edge lookup, but requires O(V²) space. Ideal for dense graphs.
- Adjacency List: Array of linked lists/vectors where adj[u] stores neighbors of u. Requires O(V + E) space. Ideal for sparse graphs.

2. Breadth-First Search (BFS):
- Strategy: Explores level by level using a FIFO Queue.
- Time Complexity: O(V + E) with adjacency list.
- Application: Finds shortest path in unweighted graphs, connected components, bipartite testing.

3. Depth-First Search (DFS):
- Strategy: Explores as deep as possible along each branch before backtracking using a Stack or recursion.
- Time Complexity: O(V + E) with adjacency list.
- Application: Topological sorting in DAGs, cycle detection, strongly connected components (Tarjan/Kosaraju).

4. Dijkstra's Shortest Path Algorithm:
- Principle: Greedy algorithm calculating the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights (weight >= 0).
- Data Structure: Uses a Min-Priority Queue (Binary Min-Heap or Fibonacci Heap) to iteratively extract the unvisited vertex with smallest tentative distance.
- Relaxation Step: If dist[u] + weight(u, v) < dist[v], update dist[v] = dist[u] + weight(u, v) and push to priority queue.
- Time Complexity:
  • With Binary Min-Heap: O((V + E) log V)
  • With Fibonacci Heap: O(E + V log V)

5. Critical Constraint:
Dijkstra FAILs on graphs with negative edge weights because its greedy assumption that a visited node's distance is permanently optimal is violated. For negative edge weights, use the Bellman-Ford algorithm (O(V * E)).

6. Verified Educational References:
- CLRS, "Introduction to Algorithms", 4th Edition, Chapter 22 (Elementary Graph Algorithms) and Section 24.3 (Dijkstra's Algorithm).
- Dijkstra, E. W. (1959), "A note on two problems in connexion with graphs", Numerische Mathematik.`,
        summary: 'BFS explores level-by-level in O(V+E). DFS backtracks in O(V+E). Dijkstra computes single-source shortest paths in O((V+E) log V) on non-negative weighted graphs.',
        bullets: [
          'Adjacency lists use O(V + E) space; adjacency matrices use O(V²) space',
          'BFS uses a FIFO Queue to find shortest paths in unweighted graphs in O(V + E)',
          'DFS uses a Stack / Recursion for cycle detection and topological sorting in O(V + E)',
          'Dijkstra uses a Min-Heap and greedy relaxation to find shortest paths in O((V + E) log V)',
          'Dijkstra requires all edge weights to be non-negative (w >= 0)',
          'Bellman-Ford handles negative edge weights in O(V * E) time'
        ],
        keywords: [
          { term: 'Adjacency List', definition: 'Space-efficient graph representation mapping each vertex to its list of neighbors.', importance: 5 },
          { term: 'Edge Relaxation', definition: 'Testing if path through u improves best-known distance to v.', importance: 5 },
          { term: 'Dijkstra Algorithm', definition: 'Greedy shortest path algorithm using a min-priority queue.', importance: 5 },
          { term: 'Topological Sort', definition: 'Linear ordering of vertices in a DAG such that for every edge u->v, u comes before v.', importance: 4 }
        ],
        flashcards: [
          { front: 'Why does Dijkstra algorithm fail on graphs with negative edge weights?', back: 'Because once a node is marked visited with minimum tentative distance, Dijkstra assumes no shorter path exists. A negative edge later violates this greedy assumption.', hint: 'Greedy finality broken by negative costs.' },
          { front: 'What is the time complexity of Dijkstra implemented with a binary min-heap?', back: 'O((V + E) log V) time.', hint: 'V extract-min + E decreases.' }
        ],
        quizzes: [
          { question: 'What is the space complexity of representing a graph with V vertices and E edges using an Adjacency List?', options: ['O(V²)', 'O(V + E)', 'O(E²)', 'O(1)'], correct: 1, explanation: 'An adjacency list stores an array of V lists containing a total of E directed edge records, using O(V + E) space.', hint: 'Vertices plus edges.', level: 1, difficulty: 'easy' },
          { question: 'Which graph traversal algorithm finds the shortest path in an UNWEIGHTED graph?', options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Kruskal Algorithm', 'Prim Algorithm'], correct: 1, explanation: 'BFS explores vertices level by level, ensuring that the first time a node is reached corresponds to the minimum number of edge hops.', hint: 'Level by level.', level: 1, difficulty: 'easy' },
          { question: 'What is the mandatory prerequisite constraint on edge weights for Dijkstra algorithm to guarantee correctness?', options: ['All edge weights must be negative', 'All edge weights must be strictly integers', 'All edge weights must be non-negative (weight >= 0)', 'The graph must have no cycles'], correct: 2, explanation: 'Dijkstra relies on greedy monotonic distance expansion; negative edge weights invalidate permanent node distance finalization.', hint: 'Non-negative edge weights.', level: 2, difficulty: 'easy' },
          { question: 'What data structure is used to optimize the extract-minimum step in Dijkstra algorithm?', options: ['Stack', 'Min-Priority Queue (Binary Min-Heap)', 'Hash Table', 'Circular Array'], correct: 1, explanation: 'A Min-Priority Queue enables extracting the vertex with the smallest tentative distance in O(log V) time.', hint: 'Min-Priority Queue.', level: 2, difficulty: 'easy' },
          { question: 'What does the Edge Relaxation step in shortest path algorithms compute for edge (u, v) with weight w?', options: ['dist[u] = dist[v] + w', 'if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; }', 'dist[v] = min(u, v)', 'dist[u] = 0'], correct: 1, explanation: 'Relaxation checks if traveling through u offers a shorter path to v than the currently recorded distance dist[v].', hint: 'If path through u is shorter, update.', level: 3, difficulty: 'medium' },
          { question: 'Which algorithm finds single-source shortest paths in graphs that MAY contain negative edge weights (and detects negative cycles)?', options: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Breadth-First Search', 'Prim Algorithm'], correct: 1, explanation: 'Bellman-Ford relaxes all E edges V-1 times, correctly finding shortest paths with negative edges and detecting negative cycles in O(V * E) time.', hint: 'Relaxes all edges V-1 times.', level: 3, difficulty: 'medium' },
          { question: 'What is the overall time complexity of Dijkstra algorithm on a graph with V vertices and E edges using a Binary Min-Heap?', options: ['O(V²)', 'O((V + E) log V)', 'O(V * E)', 'O(V³ log V)'], correct: 1, explanation: 'Extracting min V times takes O(V log V), and relaxing E edges with decrease-key takes O(E log V), giving O((V + E) log V) total time.', hint: '(V + E) log V.', level: 4, difficulty: 'medium' },
          { question: 'In a Directed Acyclic Graph (DAG), in what order must tasks be executed so that every prerequisite task finishes before dependent tasks?', options: ['Post-order sequence', 'Topological Sort order', 'Level-order sequence', 'Eulerian Path order'], correct: 1, explanation: 'Topological sorting linearly orders DAG vertices such that for every directed edge u -> v, u appears before v.', hint: 'Topological sort.', level: 4, difficulty: 'medium' },
          { question: 'How can you detect if an undirected graph contains a cycle during Depth-First Search (DFS)?', options: ['If a vertex has no neighbors', 'If DFS encounters an already-visited vertex that is NOT the immediate parent of the current vertex', 'If the graph has an odd number of vertices', 'If all edges have equal weights'], correct: 1, explanation: 'Encountering a visited back-edge to an ancestor other than the immediate parent confirms a closed loop/cycle in the undirected graph.', hint: 'Back-edge to non-parent.', level: 5, difficulty: 'medium' },
          { question: 'What is the maximum number of edges in a simple connected undirected graph with V vertices?', options: ['V', 'V - 1', 'V * (V - 1) / 2', 'V²'], correct: 2, explanation: 'Every vertex can connect to V-1 other vertices. Dividing by 2 for undirected edges gives V * (V - 1) / 2.', hint: 'V choose 2.', level: 5, difficulty: 'medium' },
          { question: 'Why is an Adjacency Matrix preferred over an Adjacency List for Dense Graphs where E is close to V²?', options: ['Adjacency matrix uses less memory for sparse graphs', 'Adjacency matrix provides O(1) direct edge lookup without pointer chasing overhead, and space is already O(V²)', 'Adjacency list cannot store directed edges', 'Adjacency matrix automatically balances trees'], correct: 1, explanation: 'When E ~ V², an adjacency list uses more memory (due to node pointers) than a compact 2D boolean/weight matrix, and matrix edge lookup is instant.', hint: 'Instant edge lookup without pointers.', level: 6, difficulty: 'medium' },
          { question: 'Which routing protocol in computer networking uses Dijkstra algorithm on link-state databases to compute shortest forwarding routes?', options: ['BGP (Border Gateway Protocol)', 'OSPF (Open Shortest Path First)', 'RIP (Routing Information Protocol)', 'DNS'], correct: 1, explanation: 'OSPF routers flood link-state packets and run Dijkstra SPF algorithm locally to compute the shortest routing table paths.', hint: 'Open Shortest Path First.', level: 6, difficulty: 'medium' },
          { question: 'What is the time complexity of the Floyd-Warshall algorithm for finding All-Pairs Shortest Paths in a graph with V vertices?', options: ['O(V log V)', 'O(V * E)', 'O(V³)', 'O(2^V)'], correct: 2, explanation: 'Floyd-Warshall uses dynamic programming with three nested loops from 1 to V, resulting in O(V³) time complexity.', hint: 'Three nested loops.', level: 7, difficulty: 'hard' },
          { question: 'What is the theoretical time complexity of Dijkstra algorithm when implemented with a Fibonacci Heap?', options: ['O(V²)', 'O(E + V log V)', 'O(E log E)', 'O(V³)'], correct: 1, explanation: 'Fibonacci heaps optimize the decrease-key operation to amortized O(1) time, reducing the total runtime from O((V+E) log V) to O(E + V log V).', hint: 'E + V log V.', level: 7, difficulty: 'hard' },
          { question: 'How does A* (A-Star) search improve upon Dijkstra algorithm in spatial navigation problems?', options: ['By ignoring all edge weights', 'By adding an admissible heuristic h(n) estimation of distance to the goal to guide search directionally', 'By running backwards only', 'By converting the graph into a spanning tree'], correct: 1, explanation: 'A* evaluates f(n) = g(n) + h(n), where g(n) is exact cost from start and h(n) is heuristic distance to goal, pruning unnecessary state exploration.', hint: 'Heuristic guiding.', level: 8, difficulty: 'hard' },
          { question: 'In Tarjan algorithm for Strongly Connected Components (SCCs), what do the discovery time and low-link values identify?', options: ['Shortest paths in undirected graphs', 'The root of an SCC reachable via tree edges and back edges without leaving the component', 'Maximum bipartite matching', 'Minimum spanning tree weight'], correct: 1, explanation: 'A vertex is the root of an SCC if and only if its low-link value equals its discovery time, popping all component nodes from the stack in O(V + E).', hint: 'Low-link equals discovery time.', level: 8, difficulty: 'hard' }
        ]
      }
    ]
  },

  // =========================================================================
  // SUBJECT 2: OPERATING SYSTEMS (5 Complete Topics)
  // =========================================================================
  {
    name: 'Operating Systems',
    code: 'operating_systems',
    color: '#10B981',
    icon: '⚙️',
    description: 'Processes, Threads, CPU Scheduling, Memory Management, Virtual Memory, and File Systems',
    topics: [
      // 2.1 Process Management
      {
        title: 'Process Management & Process Control Block (PCB)',
        topicName: 'Process Management & PCB',
        difficulty: 'EASY',
        transcript: `Topic: Process Management, States, and Process Control Block (PCB)

1. Definition of a Process:
A process is a program in execution. While a program is a passive entity stored on disk (executable file), a process is an active entity with a Program Counter, CPU registers, stack, heap, and assigned operating system resources.

2. Process Memory Layout:
- Text Section: Compiled machine instructions (read-only).
- Data Section: Global and static variables (initialized and uninitialized BSS).
- Heap: Dynamically allocated memory at runtime (malloc in C, new in C++/Java), growing upward.
- Stack: Temporary data including function call frames, parameters, local variables, and return addresses, growing downward.

3. Process States Lifecycle:
- New: Process is being created.
- Ready: Process is loaded in RAM waiting to be allocated CPU time by the scheduler.
- Running: Instructions are actively executing on a CPU core.
- Waiting (Blocked): Process is waiting for an I/O event or signal.
- Terminated: Process has finished execution and OS reclaims its resources.

4. Process Control Block (PCB):
The PCB maintains all metadata for a process:
- Process ID (PID), Process State, Program Counter (PC), CPU Registers, Scheduling Priority, Memory Page Tables, and Open File Descriptors.

5. Context Switching:
Context switching saves the state of the running process into its PCB and restores another ready process from its PCB. It is pure computational overhead.

6. Verified Educational References:
- Silberschatz, Galvin, Gagne, "Operating System Concepts", 10th Edition, Chapter 3 (Processes).
- Tanenbaum & Bos, "Modern Operating Systems", 4th Edition, Chapter 2.`,
        summary: 'A process is an active program in execution. The kernel tracks each process via a Process Control Block (PCB) and swaps execution via context switching.',
        bullets: [
          'Process memory layout consists of Text, Data, Heap (grows up), and Stack (grows down)',
          'Lifecycle states: New -> Ready -> Running -> Waiting/Blocked -> Terminated',
          'PCB stores PID, Program Counter, CPU registers, memory page tables, and file descriptors',
          'Context switching saves the old PCB state and restores the new PCB state with pure CPU overhead',
          'Processes have isolated memory spaces; threads share heap, code, and global memory',
          'Fork() system call creates an exact duplicate child process with Copy-On-Write optimization'
        ],
        keywords: [
          { term: 'Process Control Block', definition: 'Kernel data structure containing all state information for a specific process.', importance: 5 },
          { term: 'Context Switch', definition: 'Switching the CPU from one process to another, saving and loading register states.', importance: 5 },
          { term: 'Program Counter', definition: 'Register containing the memory address of the next instruction to execute.', importance: 4 },
          { term: 'Inter-Process Communication', definition: 'Mechanisms (pipes, sockets, shared memory) allowing processes to exchange data.', importance: 4 }
        ],
        flashcards: [
          { front: 'What critical information is saved into the PCB during a context switch?', back: 'Program Counter, CPU general-purpose registers, stack pointer, and process execution state.', hint: 'Everything needed to resume execution.' },
          { front: 'What is the fundamental difference between a Process and a Thread?', back: 'Processes have independent, isolated address spaces; threads share the parent process memory space (heap/data/code).', hint: 'Memory isolation vs shared heap.' }
        ],
        quizzes: [
          { question: 'What is the primary difference between a Program and a Process?', options: ['A program is written in Python; a process is written in C', 'A program is a passive executable file on disk; a process is an active program in execution', 'A program runs in kernel mode; a process runs in user mode', 'There is no difference'], correct: 1, explanation: 'A program is passive code stored on storage media; a process is the dynamic instance loaded into RAM executing on the CPU.', hint: 'Static on disk vs running in memory.', level: 1, difficulty: 'easy' },
          { question: 'Which kernel data structure stores all metadata, register states, and accounting information for an active process?', options: ['File Allocation Table (FAT)', 'Process Control Block (PCB)', 'Translation Lookaside Buffer (TLB)', 'Interrupt Vector Table'], correct: 1, explanation: 'The Process Control Block (PCB) tracks PID, program counter, register states, memory limits, and open files for each process.', hint: 'Central process control structure.', level: 1, difficulty: 'easy' },
          { question: 'When a process requests disk I/O and must wait for data transfer, which state does it transition into?', options: ['Ready', 'Running', 'Waiting / Blocked', 'Terminated'], correct: 2, explanation: 'Processes awaiting external events or I/O operations move from Running to the Waiting (Blocked) state.', hint: 'Waiting for I/O completion.', level: 2, difficulty: 'easy' },
          { question: 'In the memory layout of a C program, which segment stores dynamically allocated memory created via malloc() or new?', options: ['Text Segment', 'Stack Segment', 'Heap Segment', 'BSS Data Segment'], correct: 2, explanation: 'The Heap segment manages dynamic runtime memory allocation and grows upward toward higher memory addresses.', hint: 'Dynamic heap allocation.', level: 2, difficulty: 'easy' },
          { question: 'What is a Context Switch in an Operating System?', options: ['Changing the language compiler', 'Saving the execution state of the current process and restoring the saved state of another process', 'Switching the monitor resolution', 'Upgrading the operating system kernel'], correct: 1, explanation: 'Context switching preserves the running process registers and PC into its PCB, loading the next ready process state to share the CPU.', hint: 'Saving and swapping CPU state.', level: 3, difficulty: 'medium' },
          { question: 'Why is context switching considered pure system overhead?', options: ['It consumes hard drive storage permanently', 'The CPU performs no useful user work while saving and loading register states', 'It causes physical hardware wear', 'It destroys open network connections'], correct: 1, explanation: 'During context switching, CPU cycles are spent executing kernel management code rather than user application instructions.', hint: 'No user code runs.', level: 3, difficulty: 'medium' },
          { question: 'Which of the following resources is shared between multiple peer threads within the SAME process?', options: ['CPU Registers', 'Private Stack memory', 'Heap memory and global variables', 'Program Counter'], correct: 2, explanation: 'Threads within the same process share the text, data, and heap segments, but each thread maintains its own private stack and registers.', hint: 'Shared heap, private stack.', level: 4, difficulty: 'medium' },
          { question: 'In Unix/Linux systems, what system call creates a new child process as an exact duplicate of the calling parent process?', options: ['exec()', 'fork()', 'pthread_create()', 'wait()'], correct: 1, explanation: 'fork() duplicates the calling process, returning 0 to the child process and the child PID to the parent process.', hint: 'Standard fork syscall.', level: 4, difficulty: 'medium' },
          { question: 'What optimization allows modern operating systems to execute fork() almost instantaneously without copying all physical memory pages?', options: ['Direct Memory Access (DMA)', 'Copy-On-Write (COW)', 'Virtual Cache Bypassing', 'Demand Paging Thrashing'], correct: 1, explanation: 'Copy-On-Write shares physical pages read-only between parent and child; pages are duplicated only if one process modifies them.', hint: 'Copy only when modified.', level: 5, difficulty: 'medium' },
          { question: 'What is a Zombie Process in Unix/Linux operating systems?', options: ['A process that runs forever in an infinite loop', 'A terminated process whose parent has not yet read its exit status via wait()', 'A process that consumes 100% CPU', 'A process with no PID'], correct: 1, explanation: 'A zombie process has finished execution but retains an entry in the process table so its parent can read its exit code.', hint: 'Terminated but uncollected exit code.', level: 5, difficulty: 'medium' },
          { question: 'Which Inter-Process Communication (IPC) mechanism provides the highest data transfer speed between two local processes?', options: ['Pipes', 'Shared Memory', 'Message Queues', 'TCP Sockets'], correct: 1, explanation: 'Shared memory maps the same physical RAM pages into both processes address spaces, allowing direct memory access without kernel copying.', hint: 'Zero kernel copying.', level: 6, difficulty: 'medium' },
          { question: 'What happens to a child process if its parent process terminates without calling wait() (Orphan Process)?', options: ['The child process is immediately aborted', 'The child process is adopted by the system initialization process (init or systemd PID 1)', 'The child process runs in kernel mode forever', 'The computer reboots'], correct: 1, explanation: 'Orphaned processes are adopted by the root init process (PID 1), which periodically invokes wait() to clean up terminated child zombies.', hint: 'Adopted by PID 1.', level: 6, difficulty: 'medium' },
          { question: 'In User-Level Threads (Many-to-One model), what happens to the entire process if a single thread executes a blocking system call?', options: ['Only that single thread blocks while others continue', 'The entire process blocks because the kernel is unaware of user-level threads and sees only one kernel thread', 'The OS spawns a new process automatically', 'CPU execution speed doubles'], correct: 1, explanation: 'In the Many-to-One model, the OS kernel only manages the single underlying process thread; any blocking syscall halts all user threads.', hint: 'Kernel sees only one thread.', level: 7, difficulty: 'hard' },
          { question: 'What hardware feature prevents a user application process from corrupting another process or kernel memory?', options: ['Dual-mode CPU execution (User Mode vs Kernel Mode) paired with Base and Limit memory protection registers', 'High-speed SSD controllers', 'L3 CPU cache locking', 'Graphics card shaders'], correct: 0, explanation: 'Dual-mode CPU hardware restricts privileged instructions to Kernel mode, and MMU base/limit registers trap unauthorized memory addresses.', hint: 'Dual-mode and memory bounds.', level: 7, difficulty: 'hard' },
          { question: 'Why do modern multi-core Linux systems use CFS (Completely Fair Scheduler) red-black tree structures instead of simple priority runqueues?', options: ['Simple runqueues cannot store threads', 'CFS tracks virtual runtime (vruntime) in a red-black tree in O(log N) to ensure fair CPU proportions without rigid time slice quantization', 'CFS disables context switching', 'Red-black trees use no memory'], correct: 1, explanation: 'CFS models an ideal multitasking CPU by continually picking the task with smallest vruntime from the leftmost node of an RB-tree in O(1) pick / O(log N) insert.', hint: 'Virtual runtime tracking.', level: 8, difficulty: 'hard' },
          { question: 'What is the security risk of a Process Injection (DLL Injection / ptrace injection) attack in operating system security?', options: ['It causes hardware overheating', 'An unauthorized process injects malicious code into the address space of a legitimate running process to inherit its access privileges', 'It disables keyboard inputs', 'It deletes the BIOS chip'], correct: 1, explanation: 'Process injection forces a target process to execute arbitrary payload code, bypassing security boundaries and inheriting target permissions.', hint: 'Injecting code into target address space.', level: 8, difficulty: 'hard' }
        ]
      },

      // 2.2 CPU Scheduling
      {
        title: 'CPU Scheduling Algorithms — Fairness, Throughput & Latency',
        topicName: 'CPU Scheduling Algorithms',
        difficulty: 'MEDIUM',
        transcript: `Topic: CPU Scheduling Algorithms and Performance Metrics

1. Goal of CPU Scheduling:
CPU scheduling allocates CPU cores among ready processes to optimize performance metrics:
- CPU Utilization, Throughput, Turnaround Time (Completion - Arrival), Waiting Time (Turnaround - Burst), and Response Time.

2. Standard Scheduling Algorithms:
- FCFS (First-Come, First-Served): Non-preemptive, suffers from Convoy Effect.
- SJF / SRTF: Shortest Job First. Mathematically optimal for minimizing average waiting time.
- Round Robin (RR): Preemptive with fixed Time Quantum. Balances responsiveness.
- Priority Scheduling: Highest priority runs first. Uses Aging to prevent starvation.
- MLFQ (Multi-Level Feedback Queue): Separates interactive tasks from compute-heavy jobs dynamically.

3. Verified Educational References:
- Silberschatz et al., "Operating System Concepts", 10th Edition, Chapter 5 (CPU Scheduling).
- Arpaci-Dusseau & Arpaci-Dusseau, "Operating Systems: Three Easy Pieces", Chapter 7-10.`,
        summary: 'CPU scheduling optimizes turnaround and waiting times. FCFS causes convoy effect; SJF is mathematically optimal; Round Robin balances interactive responsiveness.',
        bullets: [
          'Metrics: Turnaround = Completion - Arrival; Waiting = Turnaround - Burst',
          'FCFS is simple but suffers from the Convoy Effect (short jobs wait behind long jobs)',
          'SJF / SRTF is mathematically optimal for minimizing average waiting time',
          'Round Robin uses a time quantum; small quantum increases context-switch overhead',
          'Priority Scheduling uses Aging to prevent indefinite starvation of low-priority tasks',
          'MLFQ dynamically separates interactive I/O tasks from compute-bound batch jobs'
        ],
        keywords: [
          { term: 'Convoy Effect', definition: 'Performance degradation in FCFS when short jobs queue behind a long CPU-bound job.', importance: 5 },
          { term: 'Time Quantum', definition: 'Fixed maximum CPU duration allocated to a process in Round Robin.', importance: 5 },
          { term: 'Aging', definition: 'Technique gradually raising waiting process priority to prevent starvation.', importance: 5 },
          { term: 'Turnaround Time', definition: 'Elapsed time from process arrival to total completion.', importance: 4 }
        ],
        flashcards: [
          { front: 'Which scheduling algorithm provides the mathematically minimum average waiting time?', back: 'Shortest Job First (SJF) / Shortest Remaining Time First (SRTF).', hint: 'Shortest jobs run first.' },
          { front: 'What is Aging in CPU priority scheduling?', back: 'Gradually increasing the priority of processes that wait in the ready queue for a long time to prevent starvation.', hint: 'Priority increases with wait time.' }
        ],
        quizzes: [
          { question: 'How is Process Waiting Time calculated?', options: ['Waiting Time = Turnaround Time - Burst Time', 'Waiting Time = Completion Time + Arrival Time', 'Waiting Time = Burst Time * 2', 'Waiting Time = Arrival Time - Completion Time'], correct: 0, explanation: 'Waiting time is the total time spent in ready queue, equal to Turnaround Time minus active CPU Burst Time.', hint: 'Turnaround minus burst.', level: 1, difficulty: 'easy' },
          { question: 'What is the Convoy Effect in CPU scheduling?', options: ['Multiple CPUs executing in parallel', 'Short processes waiting a long time behind a large CPU-bound process in FCFS', 'Processes communicating via network packets', 'Memory running out of space'], correct: 1, explanation: 'In FCFS, when a long CPU-bound process holds the processor, all short I/O-bound processes queue behind it, tanking utilization.', hint: 'Short jobs stuck behind long job.', level: 1, difficulty: 'easy' },
          { question: 'Which scheduling algorithm is mathematically optimal for minimizing average waiting time across all processes?', options: ['First-Come First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Priority Scheduling without Aging'], correct: 1, explanation: 'SJF schedules short jobs first, rapidly clearing waiting queues and mathematically minimizing total cumulative wait time.', hint: 'Shortest jobs run first.', level: 2, difficulty: 'easy' },
          { question: 'What parameter determines the maximum continuous CPU time a process receives in Round Robin scheduling?', options: ['Base address', 'Time Quantum (Time Slice)', 'Process ID', 'Disk sector size'], correct: 1, explanation: 'The Time Quantum (or time slice) sets the timer interrupt threshold for preempting the running process.', hint: 'Time slice per turn.', level: 2, difficulty: 'easy' },
          { question: 'Three processes arrive at time 0 with burst times P1=24ms, P2=3ms, P3=3ms. Under FCFS (P1, P2, P3), what is the average waiting time?', options: ['0 ms', '17 ms', '27 ms', '30 ms'], correct: 1, explanation: 'Wait times: P1=0ms, P2=24ms, P3=27ms. Total wait = 51ms. Average wait = 51 / 3 = 17ms.', hint: '(0 + 24 + 27) / 3.', level: 3, difficulty: 'medium' },
          { question: 'For the same three processes (P1=24ms, P2=3ms, P3=3ms) arriving at time 0, what is the average waiting time under SJF (P2, P3, P1)?', options: ['3 ms', '6 ms', '17 ms', '27 ms'], correct: 0, explanation: 'SJF order: P2 runs (wait 0), P3 runs (wait 3), P1 runs (wait 6). Total = 9ms. Average wait = 9 / 3 = 3ms.', hint: '(0 + 3 + 6) / 3.', level: 3, difficulty: 'medium' },
          { question: 'What is the primary danger of static Priority Scheduling without aging?', options: ['High context switch overhead', 'Starvation (Indefinite Blocking) where low priority processes never get CPU time', 'Memory leaks in heap', 'CPU overheating'], correct: 1, explanation: 'If higher-priority processes arrive continuously, lower-priority processes may starve and wait indefinitely in the ready queue.', hint: 'Low priority tasks never run.', level: 4, difficulty: 'medium' },
          { question: 'What technique solves the starvation problem in Priority Scheduling?', options: ['Decreasing time quantum', 'Aging (gradually increasing the priority of processes as they wait in ready queue)', 'Preemption disablement', 'Rebooting the server'], correct: 1, explanation: 'Aging ensures that even the lowest priority task will eventually accumulate top priority and execute.', hint: 'Priority grows with wait time.', level: 4, difficulty: 'medium' },
          { question: 'What happens to Round Robin scheduling performance if the Time Quantum is set to an extremely large value (e.g. infinity)?', options: ['It degenerates into First-Come First-Served (FCFS)', 'It behaves as Shortest Job First', 'It causes zero response time', 'It crashes the kernel'], correct: 0, explanation: 'If the quantum is larger than any burst, every process finishes in one turn without preemption, exactly like FCFS.', hint: 'Behaves like FCFS.', level: 5, difficulty: 'medium' },
          { question: 'What happens if the Round Robin Time Quantum is set extremely small (e.g. 1 microsecond)?', options: ['Throughput increases to maximum', 'Excessive context switching overhead dominates CPU cycles and destroys throughput', 'All processes finish instantly', 'Memory consumption drops to zero'], correct: 1, explanation: 'If quantum is comparable to context switch time (e.g. 10 microseconds), the CPU spends most of its time swapping registers rather than executing code.', hint: 'Switching costs dominate.', level: 5, difficulty: 'medium' },
          { question: 'In an interactive desktop system, why is Multi-Level Feedback Queue (MLFQ) ideal?', options: ['It treats all processes identically', 'Interactive I/O processes stay in top priority short-quantum queues for instant response, while batch video jobs sink to long-quantum lower queues', 'It disables background tasks', 'It uses no priority queues'], correct: 1, explanation: 'MLFQ automatically learns process behavior: interactive tasks release CPU quickly and stay top-priority; compute tasks drop down to avoid monopolizing.', hint: 'Separates interactive and batch jobs.', level: 6, difficulty: 'medium' },
          { question: 'Which formula represents Exponential Smoothing used in SJF to predict the next CPU burst length tau_{n+1}?', options: ['tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n', 'tau_{n+1} = t_n + tau_n', 'tau_{n+1} = t_n / 2', 'tau_{n+1} = alpha * 100'], correct: 0, explanation: 'Exponential smoothing weights the most recent actual burst t_n with weight alpha and past history tau_n with weight (1 - alpha).', hint: 'Weighted historical average.', level: 6, difficulty: 'medium' },
          { question: 'What is Processor Affinity in multi-core CPU scheduling?', options: ['A process preference to remain running on the same CPU core to benefit from warm cache contents', 'A core running at higher voltage', 'Locking a process to disk storage', 'Disabling interrupts on secondary cores'], correct: 0, explanation: 'Keeping a process on the same core avoids invalidating and reloading L1/L2 hardware caches, boosting throughput.', hint: 'Staying on same core for cache warmth.', level: 7, difficulty: 'hard' },
          { question: 'What is the distinction between Asymmetric Multiprocessing (AMP) and Symmetric Multiprocessing (SMP)?', options: ['AMP uses graphics cards; SMP uses mainframes', 'In AMP, one master core handles all scheduling/I/O; in SMP, each core self-schedules from a shared or private runqueue', 'SMP has only one CPU core', 'AMP does not support threads'], correct: 1, explanation: 'SMP is standard in modern OSes where all peer cores run kernel scheduling code concurrently without a single master bottleneck.', hint: 'Master core vs peer cores.', level: 7, difficulty: 'hard' },
          { question: 'In Hard Real-Time systems, what is the Rate Monotonic Scheduling (RMS) assignment rule?', options: ['Shorter period = Higher static priority', 'Longer period = Higher priority', 'Random priority', 'First come first served'], correct: 0, explanation: 'Rate Monotonic assigns static priorities inversely proportional to task periods: tasks with high frequency (short period) get highest priority.', hint: 'Higher frequency equals higher priority.', level: 8, difficulty: 'hard' },
          { question: 'What dangerous synchronization phenomenon occurred on the Mars Pathfinder spacecraft in 1997 due to CPU scheduling?', options: ['Deadlock', 'Priority Inversion (a medium priority task blocked a high priority task because a low priority task held a shared mutex)', 'Thrashing', 'Buffer overflow'], correct: 1, explanation: 'Priority inversion occurred when a medium task preempted a low task holding a mutex needed by a high task. Fixed by Priority Inheritance Protocol.', hint: 'Medium task blocking high priority task.', level: 8, difficulty: 'hard' }
        ]
      },

      // 2.3 Memory Management & Paging
      {
        title: 'Memory Management, Paging & Segmentation',
        topicName: 'Memory Management & Paging',
        difficulty: 'MEDIUM',
        transcript: `Topic: Main Memory Management, Address Binding, Paging, and Segmentation

1. Memory Management Overview:
Main memory (RAM) is the central storage directly accessible by the CPU. The Memory Management Unit (MMU) translates logical (virtual) addresses generated by the CPU into physical addresses in physical RAM.

2. Fragmentation:
- Internal Fragmentation: Wasted space inside an allocated fixed block/page because the process did not use all allocated bytes.
- External Fragmentation: Total free memory space exists to satisfy a request, but the memory is fragmented into small non-contiguous holes.

3. Paging Architecture:
Paging eliminates external fragmentation by dividing physical memory into fixed-size blocks called Frames, and logical memory into blocks of the same size called Pages (typically 4 KB).
- Address Translation: A logical address generated by the CPU is divided into:
  • Page Number (p): Used as an index into a per-process Page Table.
  • Page Offset (d): Combined with the base Frame address (f) from the page table to form physical address: (f * Frame_Size) + d.

4. Translation Lookaside Buffer (TLB):
The Page Table is stored in RAM, meaning every memory access would require two RAM accesses (one for page table, one for data). To accelerate this, modern CPUs use a high-speed associative hardware cache called the Translation Lookaside Buffer (TLB).
- TLB Hit: Translation is resolved in 1 clock cycle.
- Effective Access Time (EAT) = (Hit_Ratio * (TLB_time + RAM_time)) + ((1 - Hit_Ratio) * (TLB_time + 2 * RAM_time)).

5. Segmentation:
Segmentation supports the programmer's view of memory as a collection of variable-length logical units (Code segment, Stack segment, Data segment). A logical address is a pair (segment_number, offset).

6. Verified Educational References:
- Silberschatz et al., "Operating System Concepts", 10th Edition, Chapter 8 (Main Memory).
- Tanenbaum & Bos, "Modern Operating Systems", 4th Edition, Chapter 3.`,
        summary: 'Paging divides memory into fixed-size pages and frames, translated by MMU and accelerated by TLB hardware caches to eliminate external fragmentation.',
        bullets: [
          'Logical memory is divided into Pages; physical memory is divided into Frames (4 KB standard)',
          'Logical Address = Page Number (p) + Page Offset (d); Physical Address = Frame Number (f) + Offset (d)',
          'Paging completely eliminates external fragmentation, but incurs minor internal fragmentation',
          'Translation Lookaside Buffer (TLB) caches recent page-to-frame translations to avoid 2x RAM lookups',
          'Segmentation organizes memory into variable-length logical modules (Stack, Code, Heap)',
          'Hierarchical and Inverted Page Tables compress page table memory on 64-bit architectures'
        ],
        keywords: [
          { term: 'Frame', definition: 'Fixed-size physical RAM block matching page size.', importance: 5 },
          { term: 'Page Table', definition: 'Per-process mapping table translating logical page numbers to physical frames.', importance: 5 },
          { term: 'TLB', definition: 'High-speed associative hardware cache for page translation lookups.', importance: 5 },
          { term: 'Internal Fragmentation', definition: 'Unused allocated memory space inside the last page frame of a process.', importance: 4 }
        ],
        flashcards: [
          { front: 'Why does Paging eliminate external fragmentation?', back: 'Because any free physical frame anywhere in RAM can be allocated to any logical page of any process.', hint: 'Frames do not need to be contiguous in physical RAM.' },
          { front: 'What is the role of the TLB in memory address translation?', back: 'It caches frequent page-to-frame translations in CPU hardware, reducing average memory lookup time to ~1 clock cycle.', hint: 'High-speed hardware cache.' }
        ],
        quizzes: [
          { question: 'What hardware component translates logical (virtual) addresses generated by the CPU into physical RAM addresses?', options: ['DMA Controller', 'Memory Management Unit (MMU)', 'Interrupt Controller', 'ALU'], correct: 1, explanation: 'The MMU (Memory Management Unit) performs hardware address translation at runtime.', hint: 'Hardware unit managing memory addresses.', level: 1, difficulty: 'easy' },
          { question: 'In a paging memory system, what is the fixed-size block of physical RAM called?', options: ['Page', 'Frame', 'Segment', 'Sector'], correct: 1, explanation: 'Physical memory is divided into fixed-size Frames; logical memory is divided into Pages.', hint: 'Physical block name.', level: 1, difficulty: 'easy' },
          { question: 'Which type of fragmentation occurs when allocated fixed-size page memory is slightly larger than the actual data requested?', options: ['External Fragmentation', 'Internal Fragmentation', 'Virtual Fragmentation', 'Cache Thrashing'], correct: 1, explanation: 'Internal fragmentation is the unused space inside an allocated frame (e.g. process uses 1KB of a 4KB page).', hint: 'Wasted space inside the page boundary.', level: 2, difficulty: 'easy' },
          { question: 'If a system has 4 KB pages (4096 bytes), how many bits are required for the Page Offset (d)?', options: ['8 bits', '10 bits', '12 bits (2^12 = 4096)', '16 bits'], correct: 2, explanation: 'Since 4096 = 2^12, exactly 12 bits are required to index all individual byte offsets inside a 4 KB page.', hint: '2^12 = 4096.', level: 2, difficulty: 'easy' },
          { question: 'What is the Translation Lookaside Buffer (TLB)?', options: ['A disk cache for storing temporary files', 'A fast associative hardware cache storing recent page-to-frame address translations', 'A table of running process IDs', 'A network packet buffer'], correct: 1, explanation: 'The TLB caches recent page table entries directly inside the CPU to avoid expensive second RAM lookups.', hint: 'CPU hardware cache for page entries.', level: 3, difficulty: 'medium' },
          { question: 'If memory access time is 100ns and TLB lookup takes 10ns with a 90% TLB hit ratio, what is the Effective Access Time (EAT)?', options: ['100 ns', '120 ns', '190 ns', '210 ns'], correct: 1, explanation: 'EAT = 0.90 * (10 + 100) + 0.10 * (10 + 100 + 100) = 0.90 * 110 + 0.10 * 210 = 99 + 21 = 120ns.', hint: '90% hit (TLB+RAM) + 10% miss (TLB+2*RAM).', level: 3, difficulty: 'medium' },
          { question: 'How does Segmentation differ fundamentally from Paging?', options: ['Paging uses fixed-size blocks; Segmentation uses variable-length blocks reflecting logical program structure (Code, Stack, Heap)', 'Segmentation is slower than disk storage', 'Paging only runs in kernel mode', 'Segmentation does not use RAM'], correct: 0, explanation: 'Paging divides memory into fixed hardware blocks (4KB); Segmentation divides memory into variable-sized semantic units.', hint: 'Fixed size vs variable logical size.', level: 4, difficulty: 'medium' },
          { question: 'What happens when a segment offset exceeds the segment limit specified in the Segment Table?', options: ['The segment expands automatically', 'A hardware Trap (Segmentation Fault) is generated by the CPU', 'The operating system restarts', 'The data is written to disk'], correct: 1, explanation: 'The MMU compares offset < limit; if offset >= limit, it raises a hardware segmentation fault trap.', hint: 'Raises a segmentation fault trap.', level: 4, difficulty: 'medium' },
          { question: 'Why are Multi-Level (Hierarchical) Page Tables used in 64-bit operating systems?', options: ['To speed up CPU clock speed', 'To avoid keeping huge sparse page tables fully in RAM, allocating sub-tables only for mapped virtual memory regions', 'To eliminate the need for RAM', 'To disable context switching'], correct: 1, explanation: 'A flat 64-bit page table would require terabytes of memory; hierarchical paging allocates page table pages on demand.', hint: 'Avoids allocating gigabytes of unused page entries.', level: 5, difficulty: 'medium' },
          { question: 'What is an Inverted Page Table?', options: ['A page table stored on disk', 'A single global table indexed by physical frame number rather than per-process logical pages', 'A table sorted in reverse order', 'A binary search tree in cache'], correct: 1, explanation: 'An inverted page table has one entry per physical frame, dramatically saving RAM in large address spaces.', hint: 'One entry per physical frame.', level: 5, difficulty: 'medium' },
          { question: 'What is the purpose of the Valid/Invalid bit in a Page Table entry?', options: ['To count CPU cycles', 'To indicate whether the page is currently resident in legal physical RAM or swapped out / illegal', 'To set font colors', 'To disable the MMU'], correct: 1, explanation: 'A valid bit (1) means the page is resident in physical memory; an invalid bit (0) indicates a page fault or illegal access.', hint: 'Indicates resident in RAM vs page fault.', level: 6, difficulty: 'medium' },
          { question: 'What is shared memory implementation in a Paged architecture?', options: ['Multiple process page tables map different logical pages to the EXACT same physical frame in RAM', 'Copying data over network sockets', 'Storing data in L1 cache only', 'Writing to floppy disk'], correct: 0, explanation: 'Paging enables zero-copy sharing (shared libraries, IPC) simply by having page table entries in two processes point to identical physical frames.', hint: 'Different logical pages pointing to same frame.', level: 6, difficulty: 'medium' },
          { question: 'What is Address Space Identifier (ASID) tagging in modern TLBs?', options: ['A mechanism allowing the TLB to store translations for multiple processes simultaneously without flushing on context switch', 'A memory encryption key', 'A disk partition table', 'A CPU temperature monitor'], correct: 0, explanation: 'ASID tags each TLB entry with its owner PID, eliminating the need to flush the entire TLB on every context switch.', hint: 'Tags entries with process ID to avoid flushing.', level: 7, difficulty: 'hard' },
          { question: 'Why does External Fragmentation occur in dynamic variable-partition memory allocation systems?', options: ['Because memory is fixed size', 'Because free memory holes become scattered as processes of varying sizes load and terminate over time', 'Because TLB misses occur', 'Because page sizes are 4KB'], correct: 1, explanation: 'As processes allocate and free irregular memory blocks, contiguous free RAM is broken into small unusable fragments.', hint: 'Scattered non-contiguous free memory holes.', level: 7, difficulty: 'hard' },
          { question: 'What is the memory compaction technique and why is it rarely used in modern production servers?', options: ['Compaction merges free holes by physically moving all running processes in RAM, incurring massive I/O and CPU stall overhead', 'Compaction deletes user files', 'Compaction disables virtual memory', 'Compaction is impossible in hardware'], correct: 0, explanation: 'Relocating all active process memory to one end of RAM requires freezing execution and massive memory copying.', hint: 'Huge CPU and latency pause overhead.', level: 8, difficulty: 'hard' },
          { question: 'How do Huge Pages (e.g. 2 MB or 1 GB pages in Linux) improve database performance for systems like PostgreSQL or Oracle?', options: ['They eliminate the need for SQL queries', 'They increase TLB reach, allowing the TLB to cover gigabytes of memory with fewer entries and drastically reducing TLB misses', 'They disable memory protection', 'They compress data by 50%'], correct: 1, explanation: 'A 2MB page covers 512x more memory per TLB entry than a 4KB page, minimizing expensive page table walks for huge RAM workloads.', hint: 'Vastly increases TLB reach.', level: 8, difficulty: 'hard' }
        ]
      },

      // 2.4 Virtual Memory & Page Replacement
      {
        title: 'Virtual Memory & Page Replacement (LRU, FIFO, Clock)',
        topicName: 'Virtual Memory & Page Replacement',
        difficulty: 'HARD',
        transcript: `Topic: Virtual Memory, Demand Paging, and Page Replacement Algorithms

1. Virtual Memory Principle:
Virtual memory separates logical user memory from physical memory, allowing the execution of processes that require more memory than is physically available in physical RAM.

2. Demand Paging and Page Faults:
In demand paging, pages are loaded into RAM only when accessed during execution:
- Page Fault Trap: When the CPU accesses a page whose valid bit in the page table is 0 (invalid), the hardware triggers a Page Fault interrupt to the kernel.
- Page Fault Handling Sequence:
  1. Trap to OS kernel and save process registers.
  2. Check if memory reference was valid or illegal.
  3. Find a free physical frame in RAM.
  4. Issue disk I/O to read required page from swap backing store.
  5. Update page table (set frame number and valid bit = 1).
  6. Restart the interrupted instruction seamlessly.

3. Page Replacement Algorithms:
When physical RAM is full and a page fault occurs, the OS must select a Victim Frame to evict to disk:

A. FIFO (First-In, First-Out):
- Evicts the oldest page brought into memory.
- Belady's Anomaly: In FIFO, allocating MORE physical frames can counter-intuitively result in MORE page faults.

B. Optimal Page Replacement (OPT / MIN):
- Evicts the page that will not be used for the longest period of future time.
- Serves as the theoretical benchmark; impossible to implement in practice because future references cannot be known.

C. Least Recently Used (LRU):
- Evicts the page that has not been used for the longest period of past time.
- Optimal practical approximation of OPT using past behavior to predict future.
- Implemented with hardware timestamps or doubly-linked reference stacks.

D. Clock (Second-Chance) Algorithm:
- Practical approximation of LRU using a circular buffer and a single Reference Bit (0 or 1).
- Hand pointer inspects pages: if reference bit is 1, clears to 0 and advances; if reference bit is 0, selects that page as the victim.

4. Thrashing:
Thrashing occurs when a system spends more time swapping pages in and out of disk than executing user instructions (CPU utilization drops to near zero while disk queue is 100%).
- Cause: Sum of Working Sets of all active processes exceeds total available physical RAM.
- Solution: Working Set Model (allocates frames based on active working set window Delta) or reducing multiprogramming degree.

5. Verified Educational References:
- Silberschatz et al., "Operating System Concepts", 10th Edition, Chapter 9 (Virtual Memory).
- Belady, L. A. (1966), "A study of replacement algorithms for a virtual-storage computer", IBM Systems Journal.`,
        summary: 'Virtual memory uses demand paging and page fault traps. LRU and Clock algorithms replace victim pages. Thrashing is prevented by the Working Set model.',
        bullets: [
          'Virtual memory allows running programs larger than physical RAM via swap backing store',
          'Page Fault Trap occurs when accessing a non-resident page (valid bit = 0)',
          'FIFO suffers from Beladys Anomaly where more frames can cause more page faults',
          'Optimal (OPT) evicts page unused for longest future time (theoretical benchmark)',
          'LRU replaces the page unused for longest past time; Clock provides efficient O(1) second-chance approximation',
          'Thrashing occurs when working sets exceed RAM; resolved by working set frame allocation'
        ],
        keywords: [
          { term: 'Page Fault', definition: 'Hardware trap generated when CPU accesses a virtual page not resident in RAM.', importance: 5 },
          { term: 'Belady Anomaly', definition: 'Phenomenon where increasing frame count increases page fault count in FIFO.', importance: 5 },
          { term: 'LRU Algorithm', definition: 'Evicting the page that has gone longest without being referenced.', importance: 5 },
          { term: 'Thrashing', definition: 'High disk swapping activity and near-zero CPU utilization caused by memory oversubscription.', importance: 5 }
        ],
        flashcards: [
          { front: 'What is Beladys Anomaly in page replacement?', back: 'The counter-intuitive phenomenon where allocating more physical page frames causes MORE page faults under the FIFO algorithm.', hint: 'More memory leading to more faults in FIFO.' },
          { front: 'How does the Clock (Second-Chance) page replacement algorithm work?', back: 'It rotates a pointer around pages checking reference bits: if bit=1, reset to 0 and give second chance; if bit=0, evict this victim.', hint: 'Circular buffer with reference bit reset.' }
        ],
        quizzes: [
          { question: 'What hardware event is triggered when a process attempts to access a virtual page whose valid bit is 0 in the page table?', options: ['Segmentation Fault', 'Page Fault Trap', 'TLB Flush', 'Stack Underflow'], correct: 1, explanation: 'A Page Fault trap occurs when accessing a non-resident page, prompting the kernel to load it from disk swap.', hint: 'Page Fault interrupt.', level: 1, difficulty: 'easy' },
          { question: 'What is the primary benefit of Virtual Memory?', options: ['It increases CPU clock frequency', 'It allows programs to execute even if their total memory size exceeds physical RAM capacity', 'It eliminates the need for hard drives', 'It prevents all software bugs'], correct: 1, explanation: 'Virtual memory isolates processes and enables execution of large programs by swapping pages on demand.', hint: 'Run programs larger than RAM.', level: 1, difficulty: 'easy' },
          { question: 'What is Belady Anomaly in page replacement algorithms?', options: ['Page replacement runs in O(1) time', 'Allocating more physical frames results in MORE page faults under FIFO', 'Memory leaks occur in heap', 'CPU temperature rises'], correct: 1, explanation: 'Belady Anomaly proves that for FIFO, increasing the number of allocated memory frames can increase the number of page faults.', hint: 'More frames equal more faults in FIFO.', level: 2, difficulty: 'easy' },
          { question: 'Which page replacement algorithm is the theoretical ideal that achieves the lowest possible page fault rate on all workloads?', options: ['First-In First-Out (FIFO)', 'Optimal Page Replacement (OPT / MIN)', 'Least Recently Used (LRU)', 'Most Recently Used (MRU)'], correct: 1, explanation: 'OPT replaces the page that will not be used for the longest future time, serving as the unattainable benchmark.', hint: 'Optimal future knowledge.', level: 2, difficulty: 'easy' },
          { question: 'How does the Least Recently Used (LRU) algorithm select a victim frame for eviction?', options: ['It chooses the page with the lowest memory address', 'It chooses the page that has not been accessed for the longest period of past time', 'It picks a frame at random', 'It evicts the largest page'], correct: 1, explanation: 'LRU uses past temporal locality to predict the future, evicting the page that went unreferenced for longest.', hint: 'Longest time since last past access.', level: 3, difficulty: 'medium' },
          { question: 'How does the Clock (Second-Chance) page replacement algorithm approximate LRU with low overhead?', options: ['By keeping a sorted array of timestamps', 'By circulating a hand pointer that checks a single hardware Reference Bit (if 1 -> set 0; if 0 -> evict)', 'By calculating hash checksums of pages', 'By running machine learning models'], correct: 1, explanation: 'The Clock algorithm inspects reference bits circularly in O(1), giving pages with bit 1 a second chance.', hint: 'Reference bit reset in circular loop.', level: 3, difficulty: 'medium' },
          { question: 'Given page reference string [1, 2, 3, 4, 1, 2] with 3 initially empty physical frames under FIFO, how many page faults occur?', options: ['3', '4', '6', '5'], correct: 2, explanation: 'Frames: 1(fault), 1-2(fault), 1-2-3(fault), 4 replaces 1(fault), 1 replaces 2(fault), 2 replaces 3(fault). Total = 6 page faults.', hint: 'Every single access causes a miss in this sequence.', level: 4, difficulty: 'medium' },
          { question: 'What is Thrashing in an Operating System?', options: ['A process writing huge data to SSD', 'A state where the OS spends almost all CPU cycles swapping pages in and out of disk with near-zero useful execution', 'Network bandwidth overload', 'Compiler optimization error'], correct: 1, explanation: 'Thrashing occurs when the sum of process working sets exceeds RAM, causing continuous page faulting and disk bottlenecks.', hint: 'CPU at 0%, disk swapping at 100%.', level: 4, difficulty: 'medium' },
          { question: 'What does the Working Set Model use to determine how many frames a process requires to prevent thrashing?', options: ['Total hard drive capacity', 'The set of distinct pages referenced by the process during the most recent time window Delta', 'The process ID number', 'The number of threads in CPU'], correct: 1, explanation: 'The Working Set W(t, Delta) captures the active working locality of pages referenced in the past Delta time units.', hint: 'Distinct pages referenced in recent window.', level: 5, difficulty: 'medium' },
          { question: 'What is a Dirty Bit (Modified Bit) in a page table entry and why is it important during page eviction?', options: ['It marks corrupted data', 'It indicates if a page was modified in RAM; if 0 (clean), it can be discarded without writing to disk swap', 'It tracks process priority', 'It disables memory caching'], correct: 1, explanation: 'A clean page (dirty bit = 0) is already identical to disk contents, avoiding expensive disk write I/O during eviction.', hint: 'Avoids writing unchanged pages to disk.', level: 5, difficulty: 'medium' },
          { question: 'What is Page Buffering in virtual memory management?', options: ['Maintaining a pool of pre-cleared free frames so page fault reads start immediately before victims are written out', 'Compressing RAM in zip files', 'Reading 100 pages ahead always', 'Disabling swap files'], correct: 0, explanation: 'Page buffering keeps a pool of free frames ready so the required page can be read into memory immediately without waiting for victim writeout.', hint: 'Pre-allocated free frame pool.', level: 6, difficulty: 'medium' },
          { question: 'Why are Stack Algorithms (such as LRU and Optimal) immune to Belady Anomaly?', options: ['They do not use memory', 'The set of pages in memory for n frames is always a strict subset of the pages in memory for n+1 frames', 'They only run on 64-bit CPUs', 'They use FIFO queues internally'], correct: 1, explanation: 'Stack property guarantees M(n) is subset of M(n+1), mathematically proving page faults can never increase with more frames.', hint: 'Set of frames for n is subset of n+1.', level: 6, difficulty: 'medium' },
          { question: 'What is Copy-On-Write (COW) and how does it optimize virtual memory during process fork()?', options: ['It copies all memory immediately', 'Parent and child share physical pages read-only; physical duplication happens only when either process writes to a page', 'It encrypts pages on write', 'It writes all memory to disk'], correct: 1, explanation: 'COW delays page copying until a write occurs, saving immense RAM and CPU time for fork() followed by exec().', hint: 'Shared read-only until write occurs.', level: 7, difficulty: 'hard' },
          { question: 'In the Enhanced Second-Chance (Clock) algorithm, which page class is chosen first for eviction among (Reference, Modified) pairs?', options: ['(1, 1): recently used and modified', '(1, 0): recently used and clean', '(0, 1): not recently used but modified', '(0, 0): neither recently used nor modified'], correct: 3, explanation: '(0, 0) is the optimal victim because it has not been recently accessed and requires zero disk write I/O to evict.', hint: 'Unreferenced and clean.', level: 7, difficulty: 'hard' },
          { question: 'What is Memory Ballooning in virtual machine hypervisors (e.g. VMware, KVM)?', options: ['Increasing RAM hardware physically', 'A balloon driver inside the guest OS inflates to consume guest RAM, forcing guest OS page replacement and reclaiming host RAM', 'Compressing CPU cache', 'Overclocking memory bus'], correct: 1, explanation: 'A guest balloon driver requests memory, forcing the guest kernel to page out its own pages and letting the hypervisor reclaim physical host RAM.', hint: 'Guest driver inflates to reclaim host RAM.', level: 8, difficulty: 'hard' },
          { question: 'What is the Zero-Page Optimization in modern OS kernels?', options: ['A single dedicated read-only physical frame filled with zeros mapped to all newly allocated anonymous memory pages', 'Deleting all files on reboot', 'A CPU register containing zero', 'A compiler flag'], correct: 0, explanation: 'All new zeroed allocations point to one shared read-only zero frame; COW allocates real RAM only when modified.', hint: 'Single shared read-only zero frame.', level: 8, difficulty: 'hard' }
        ]
      },

      // 2.5 File Systems & Disk Scheduling
      {
        title: 'File Systems, Inodes & Disk Scheduling (SCAN, C-SCAN)',
        topicName: 'File Systems & Disk Scheduling',
        difficulty: 'MEDIUM',
        transcript: `Topic: File Systems, Inode Architecture, and Disk Scheduling Algorithms

1. File System Structure and Inodes:
A file is an abstract contiguous logical address space. In Unix/Linux (ext4), files are managed via Inodes (Index Nodes):
- Inode Contents: File mode/permissions, owner UID/GID, file size, timestamps (atime, mtime, ctime), link count, and block pointers.
- Note: Inodes do NOT store file names! Directory entries (dentries) map file names to Inode numbers.
- Inode Pointer Architecture: Direct pointers (e.g., 12 direct block addresses), Single Indirect pointer (points to block of addresses), Double Indirect pointer, Triple Indirect pointer.

2. File Allocation Methods:
- Contiguous Allocation: Fast sequential access, but suffers from external fragmentation and unknown file growth.
- Linked Allocation: No external fragmentation, but slow direct access (must traverse pointer chain) and pointer reliability overhead.
- Indexed Allocation: Inode index blocks bring direct O(1) block lookups without external fragmentation.

3. Hard Links vs Symbolic (Soft) Links:
- Hard Link: Another directory entry pointing to the SAME Inode number. Deleting one file name does not delete data until Inode link_count reaches 0. Cannot cross filesystem partitions.
- Symbolic Link (Symlink): A special file containing the path string to another target file. If target is deleted, symlink becomes a broken dangling link. Can cross partitions.

4. Disk Scheduling Algorithms:
Disk arms have mechanical seek latency. Disk schedulers order I/O requests to minimize total head movement:
- FCFS: Fair but high seek time.
- SSTF (Shortest Seek Time First): Serves request closest to current head position. Can cause starvation of distant tracks.
- SCAN (Elevator Algorithm): Arm sweeps in one direction servicing all requests until reaching disk end, then reverses direction.
- C-SCAN (Circular SCAN): Sweeps in one direction servicing requests; upon reaching end, immediately returns to start without servicing requests on return trip, providing uniform wait times.
- LOOK / C-LOOK: Like SCAN/C-SCAN, but only travels as far as the last request in that direction rather than the physical disk boundary.

5. Verified Educational References:
- Silberschatz et al., "Operating System Concepts", 10th Edition, Chapters 13-15 (File-System Interface and Mass-Storage Structure).
- McKusick et al., "The Design and Implementation of the FreeBSD Operating System".`,
        summary: 'File systems use Inodes and indirect pointers. Hard links share inodes; symlinks store target paths. SCAN and C-SCAN optimize mechanical disk seek times.',
        bullets: [
          'Inodes store file metadata and direct/indirect block pointers, but NOT file names',
          'Directory entries (dentries) map human-readable file names to Inode numbers',
          'Hard links increment inode link count; soft symlinks store target file path strings',
          'SSTF minimizes instantaneous seek time but risks starvation for distant tracks',
          'SCAN (Elevator) sweeps back and forth across tracks; C-SCAN sweeps in one direction for uniform latency',
          'Journaling file systems (ext4, NTFS) record transaction logs to guarantee consistency across crashes'
        ],
        keywords: [
          { term: 'Inode', definition: 'Data structure on disk storing file metadata, permissions, and block pointers.', importance: 5 },
          { term: 'Hard Link', definition: 'Directory entry pointing directly to an existing inode number.', importance: 5 },
          { term: 'Symbolic Link', definition: 'File storing path string to another target file.', importance: 4 },
          { term: 'C-SCAN', definition: 'Circular elevator disk scheduling algorithm providing uniform waiting time.', importance: 5 }
        ],
        flashcards: [
          { front: 'Does an Inode store the name of a file in Unix/Linux?', back: 'No! File names are stored exclusively inside Directory Entries (dentries) mapping to Inode numbers.', hint: 'Directories hold the name-to-inode mapping.' },
          { front: 'What is the main advantage of C-SCAN over standard SCAN disk scheduling?', back: 'C-SCAN provides more uniform waiting times by treating the disk tracks as a circular list without servicing on return.', hint: 'Uniform wait times without reverse scanning.' }
        ],
        quizzes: [
          { question: 'What crucial piece of file information is NOT stored inside a Unix Inode?', options: ['File Size', 'Owner User ID (UID)', 'File Name', 'Direct Block Pointers'], correct: 2, explanation: 'File names are stored in Directory entries (dentries), which map file names to corresponding Inode numbers.', hint: 'Directories map names to inodes.', level: 1, difficulty: 'easy' },
          { question: 'What is a Hard Link in a Unix file system?', options: ['A shortcut storing a path string', 'An additional directory entry pointing to the exact same Inode number on the same filesystem', 'A backup copy of file data', 'A network link'], correct: 1, explanation: 'A hard link creates another name referencing the same underlying Inode and increments its link_count.', hint: 'Another directory entry for the same inode.', level: 1, difficulty: 'easy' },
          { question: 'What happens to a Symbolic Link (Soft Link) if the original target file is deleted?', options: ['The target is restored from backup', 'The symlink becomes a broken (dangling) link pointing to a non-existent path', 'The symlink becomes a hard link', 'The filesystem crashes'], correct: 1, explanation: 'A symlink only contains the target path string; deleting the target leaves a dangling link.', hint: 'Points to a missing path.', level: 2, difficulty: 'easy' },
          { question: 'What is the primary seek-time optimization goal of Disk Scheduling algorithms?', options: ['To speed up CPU clock speed', 'To minimize total mechanical read/write head seek distance and arm movement across disk cylinders', 'To compress file bytes', 'To delete duplicate files'], correct: 1, explanation: 'Moving mechanical disk arms is the slowest hardware operation; scheduling orders requests to minimize seek distance.', hint: 'Minimize mechanical arm travel.', level: 2, difficulty: 'easy' },
          { question: 'Which disk scheduling algorithm selects the request closest to the current head position, but risks starvation for distant tracks?', options: ['FCFS', 'Shortest Seek Time First (SSTF)', 'C-SCAN', 'C-LOOK'], correct: 1, explanation: 'SSTF greedily visits nearby cylinders first, starving requests on far ends if new close requests arrive.', hint: 'Shortest seek first.', level: 3, difficulty: 'medium' },
          { question: 'How does the SCAN (Elevator) disk scheduling algorithm operate?', options: ['It services requests randomly', 'The head moves in one direction servicing all requests until reaching the end of disk, then reverses direction', 'It only services even track numbers', 'It stops after 5 requests'], correct: 1, explanation: 'Like a building elevator, SCAN travels continuously to the disk end before reversing direction.', hint: 'Sweeps like an elevator.', level: 3, difficulty: 'medium' },
          { question: 'Why does Circular SCAN (C-SCAN) provide more uniform waiting times than standard SCAN?', options: ['It moves the disk arm faster', 'It services requests in one direction only, returning to the start without servicing to prevent edge tracks from waiting twice as long', 'It deletes waiting requests', 'It uses SSD flash memory'], correct: 1, explanation: 'SCAN favors middle tracks because it reverses over them twice; C-SCAN provides uniform arrival distribution.', hint: 'One-way sweep avoids favoring middle.', level: 4, difficulty: 'medium' },
          { question: 'How does LOOK and C-LOOK improve upon SCAN and C-SCAN?', options: ['The arm only travels as far as the final request in that direction, rather than traveling all the way to the physical disk edge', 'It looks at file names', 'It bypasses kernel buffers', 'It doubles disk capacity'], correct: 0, explanation: 'LOOK looks ahead and reverses as soon as the last request is serviced, avoiding pointless travel to cylinder 0 or max.', hint: 'Reverses at last request instead of disk boundary.', level: 4, difficulty: 'medium' },
          { question: 'In an Inode with 12 direct pointers, 1 single indirect, and 1 double indirect pointer (block size 4 KB, 4-byte pointers), what is the direct addressable capacity?', options: ['12 KB', '48 KB (12 * 4 KB)', '1 MB', '4 GB'], correct: 1, explanation: '12 direct pointers * 4 KB block size = 48 KB of directly addressable file data.', hint: '12 pointers * 4KB each.', level: 5, difficulty: 'medium' },
          { question: 'What is a Journaling File System (e.g. ext4, NTFS, XFS)?', options: ['A file system that logs user diary notes', 'A file system that logs intended metadata/data writes to a circular journal buffer before committing to prevent corruption on crash', 'A file system without inodes', 'An unformatted disk partition'], correct: 1, explanation: 'Journaling writes transaction logs first so that if power fails, the filesystem replays or aborts logs in seconds on reboot.', hint: 'Atomic transaction logging before commit.', level: 5, difficulty: 'medium' },
          { question: 'Why cannot Hard Links cross filesystem partition boundaries in Linux?', options: ['Security permissions forbid it', 'Inode numbers are unique only within a single specific filesystem partition', 'Hard links are too large for partitions', 'CPUs do not support cross-partition pointers'], correct: 1, explanation: 'Inode numbers are local to a partition; Inode 100 on partition A is completely different from Inode 100 on partition B.', hint: 'Inode numbers are partition-local.', level: 6, difficulty: 'medium' },
          { question: 'What is Virtual File System (VFS) in the Linux kernel architecture?', options: ['A file system running in a virtual machine', 'An abstraction layer providing standard POSIX file system APIs (open, read, write) across diverse underlying file systems (ext4, NFS, FAT)', 'A ramdisk without storage', 'A backup tool'], correct: 1, explanation: 'VFS abstracts concrete storage formats so user applications use identical syscalls whether reading local ext4 or remote NFS.', hint: 'Uniform abstraction layer over all filesystems.', level: 6, difficulty: 'medium' },
          { question: 'What is the Fast File System (FFS) Cylinder Group optimization in Unix?', options: ['Placing related inodes, directory entries, and data blocks in the same physical cylinder group to minimize head seek latency', 'Spinning the disk at 15,000 RPM', 'Eliminating inodes', 'Compressing all files'], correct: 0, explanation: 'Cylinder groups store related directory files close together physically on disk, drastically cutting seek distances.', hint: 'Colocating related data blocks on same cylinder.', level: 7, difficulty: 'hard' },
          { question: 'What happens during an ext4 fsck (File System Consistency Check) when unreferenced allocated inodes with link_count > 0 are discovered after a crash?', options: ['They are permanently deleted', 'They are reconnected into the /lost+found directory', 'They are formatted to zeros', 'They are emailed to root'], correct: 1, explanation: 'fsck preserves orphaned data by creating directory entries for unlinked inodes in /lost+found.', hint: 'Saved into lost+found.', level: 7, difficulty: 'hard' },
          { question: 'How does Log-Structured File System (LFS) optimize write performance on mass storage devices?', options: ['It buffers all writes in RAM and writes them sequentially in a continuous append-only log, converting random writes into blazing fast sequential writes', 'It deletes old files automatically', 'It disables file locking', 'It stores data in BIOS'], correct: 0, explanation: 'LFS buffers writes and writes entire segments sequentially, eliminating random disk head seeks.', hint: 'Sequential append-only log writes.', level: 8, difficulty: 'hard' },
          { question: 'Why is TRIM command critical for Flash SSD storage performance in modern operating systems?', options: ['It cleans dust from SATA ports', 'It informs the SSD controller which blocks are no longer valid, allowing Garbage Collection and Wear Leveling to avoid expensive write amplification', 'It doubles SSD voltage', 'It encrypts flash cells'], correct: 1, explanation: 'SSDs cannot overwrite pages without erasing entire blocks; TRIM lets the SSD erase stale pages in background ahead of writes.', hint: 'Informs SSD controller of deleted blocks.', level: 8, difficulty: 'hard' }
        ]
      }
    ]
  },

  // =========================================================================
  // SUBJECT 3: DATA ANALYTICS & MACHINE LEARNING (5 Complete Topics)
  // =========================================================================
  {
    name: 'Data Analytics',
    code: 'data_analytics',
    color: '#F59E0B',
    icon: '📊',
    description: 'Descriptive Statistics, Data Preprocessing, Linear Regression, Logistic Regression, and Clustering Algorithms',
    topics: [
      // 3.1 Descriptive Statistics
      {
        title: 'Descriptive Statistics & Central Tendency Measures',
        topicName: 'Descriptive Statistics',
        difficulty: 'EASY',
        transcript: `Topic: Descriptive Statistics, Measures of Central Tendency, and Dispersion

1. Purpose of Descriptive Statistics:
Descriptive statistics summarize, organize, and quantitatively describe the essential characteristics of a dataset without making inferences about a broader population.

2. Measures of Central Tendency:
- Mean (Arithmetic Average): Sum of all values divided by count (mu = sum(x) / N). Sensitive to extreme outliers.
- Median: The middle value when data is sorted in ascending order. If N is even, it is the average of the two middle values. Highly robust to extreme outliers.
- Mode: The most frequently occurring value in the dataset. Useful for categorical and discrete data.

3. Measures of Dispersion (Spread):
- Variance (sigma²): Average squared deviation from the mean: sigma² = sum((x_i - mu)²) / N. Sample variance uses (n - 1) in the denominator (Bessel's Correction) to eliminate bias.
- Standard Deviation (sigma): The square root of variance (sigma = sqrt(variance)). Expressed in the exact same measurement units as the original data.
- Range: Difference between Maximum and Minimum values.
- Interquartile Range (IQR): IQR = Q3 (75th percentile) - Q1 (25th percentile). Represents the middle 50% of the distribution and resists outliers.

4. Skewness and Distribution Shapes:
- Symmetrical (Normal Distribution): Mean = Median = Mode.
- Positive (Right-Skewed): Tail extends to the right. Mean > Median > Mode (extreme high values pull the mean right).
- Negative (Left-Skewed): Tail extends to the left. Mean < Median < Mode (extreme low values pull the mean left).

5. Outlier Detection (Tukey's Fences):
- Outlier Rule: Any data point < (Q1 - 1.5 * IQR) or > (Q3 + 1.5 * IQR) is flagged as an outlier.

6. Verified Educational References:
- James, Witten, Hastie, Tibshirani, "An Introduction to Statistical Learning" (ISLR), Chapter 2.
- OpenIntro Statistics, 4th Edition, Chapter 2 (Summarizing Data).`,
        summary: 'Descriptive statistics quantify central tendency (mean, median, mode) and dispersion (variance, std dev, IQR) to summarize distributions and detect outliers.',
        bullets: [
          'Mean is sensitive to outliers; Median is robust and represents the 50th percentile',
          'Standard deviation is the square root of variance, expressed in original data units',
          'Sample variance divides by (n - 1) (Bessels Correction) to provide an unbiased estimator',
          'Right-skewed distributions have Mean > Median; Left-skewed distributions have Mean < Median',
          'Interquartile Range (IQR = Q3 - Q1) measures the middle 50% spread',
          'Tukeys Fences identify outliers beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR'
        ],
        keywords: [
          { term: 'Mean', definition: 'Arithmetic average of all values, sensitive to extreme outliers.', importance: 5 },
          { term: 'Median', definition: 'Middle value in a sorted dataset, robust to extreme outliers.', importance: 5 },
          { term: 'Standard Deviation', definition: 'Measure of spread around the mean in original measurement units.', importance: 5 },
          { term: 'IQR', definition: 'Interquartile Range representing the difference between 75th and 25th percentiles.', importance: 4 }
        ],
        flashcards: [
          { front: 'Why is the Median preferred over the Mean for skewed distributions like household income?', back: 'Because the Median is not distorted by extreme outliers (e.g. billionaires), reflecting true central tendency.', hint: 'Median is robust to extreme values.' },
          { front: 'What is Bessels Correction in sample variance calculation?', back: 'Dividing the sum of squared deviations by (n - 1) instead of n to correct for sample estimation bias.', hint: 'n - 1 denominator for sample variance.' }
        ],
        quizzes: [
          { question: 'Which measure of central tendency is most severely distorted by extreme outliers in a dataset?', options: ['Median', 'Mode', 'Arithmetic Mean', 'Interquartile Range'], correct: 2, explanation: 'The arithmetic mean incorporates every numerical value; extreme high or low outliers pull the mean heavily.', hint: 'Sum of all values divided by count.', level: 1, difficulty: 'easy' },
          { question: 'In a dataset containing values [2, 4, 4, 4, 6, 8, 20], what is the Mode?', options: ['4', '6', '7', '20'], correct: 0, explanation: 'The mode is the most frequent value. The number 4 appears three times, more than any other value.', hint: 'Most frequent number.', level: 1, difficulty: 'easy' },
          { question: 'What is the relationship between Variance and Standard Deviation?', options: ['Variance = Standard Deviation / 2', 'Standard Deviation = Square Root of Variance', 'Variance = Square Root of Standard Deviation', 'They are completely unrelated'], correct: 1, explanation: 'Standard deviation is the positive square root of variance, returning dispersion back to original units.', hint: 'Square root of variance.', level: 2, difficulty: 'easy' },
          { question: 'In a right-skewed (positively skewed) distribution, what is the typical order of the three central tendency measures?', options: ['Mean < Median < Mode', 'Mode < Median < Mean', 'Mean = Median = Mode', 'Median < Mode < Mean'], correct: 1, explanation: 'In right-skewed data, long right tails pull the Mean highest, followed by Median, with Mode at the peak.', hint: 'Mean is pulled highest by the right tail.', level: 2, difficulty: 'easy' },
          { question: 'What is the Interquartile Range (IQR) of a dataset with Q1 = 25 and Q3 = 75?', options: ['25', '50 (75 - 25)', '75', '100'], correct: 1, explanation: 'IQR = Q3 - Q1 = 75 - 25 = 50. It measures the spread of the middle 50% of data.', hint: 'Q3 minus Q1.', level: 3, difficulty: 'medium' },
          { question: 'Why does sample variance divide by (n - 1) instead of n (Bessel Correction)?', options: ['To make calculation easier', 'To correct for downward bias because sample mean is closer to sample data than true population mean', 'To double the variance', 'Because sample sizes are always odd'], correct: 1, explanation: 'Bessel correction provides an unbiased estimator of true population variance.', hint: 'Corrects sample bias.', level: 3, difficulty: 'medium' },
          { question: 'Using Tukey Outlier Rule, what are the lower and upper fences for Q1 = 20, Q3 = 40, and IQR = 20?', options: ['0 and 60', '-10 (20 - 1.5*20) and 70 (40 + 1.5*20)', '20 and 40', '10 and 50'], correct: 1, explanation: 'Lower fence = 20 - (1.5 * 20) = -10. Upper fence = 40 + (1.5 * 20) = 70.', hint: 'Q1 - 1.5*IQR and Q3 + 1.5*IQR.', level: 4, difficulty: 'medium' },
          { question: 'According to the Empirical Rule (68-95-99.7), what percentage of data falls within 2 standard deviations in a Normal distribution?', options: ['50%', '68%', '95%', '99.7%'], correct: 2, explanation: 'In a standard bell curve, ~68% falls within 1 std dev, ~95% within 2 std dev, and ~99.7% within 3 std dev.', hint: '68-95-99.7 rule.', level: 4, difficulty: 'medium' },
          { question: 'If all values in a dataset are multiplied by a constant factor k, how does the Standard Deviation change?', options: ['It remains unchanged', 'It is multiplied by |k|', 'It is multiplied by k²', 'It becomes zero'], correct: 1, explanation: 'Scaling every observation by k scales dispersion and standard deviation by |k| (and variance by k²).', hint: 'Multiplied by absolute value of k.', level: 5, difficulty: 'medium' },
          { question: 'What is the Z-Score of a data point x with value 85 in a distribution with mean 70 and standard deviation 10?', options: ['0.85', '1.5 ((85 - 70) / 10)', '2.0', '15'], correct: 1, explanation: 'Z-Score = (x - mean) / std_dev = (85 - 70) / 10 = 15 / 10 = +1.5 standard deviations above mean.', hint: '(Value - Mean) / Std Dev.', level: 5, difficulty: 'medium' },
          { question: 'What does a Pearson correlation coefficient of r = -0.92 indicate between two continuous variables?', options: ['No relationship', 'A strong negative linear relationship (as one variable increases, the other decreases)', 'A weak positive relationship', 'A non-linear relationship only'], correct: 1, explanation: 'An r value close to -1.0 indicates a strong negative linear correlation.', hint: 'Strong negative slope.', level: 6, difficulty: 'medium' },
          { question: 'Why does correlation NOT imply causation in statistical analysis?', options: ['Correlation is always inaccurate', 'A strong correlation can be caused by a confounding third variable (lurking variable) or coincidence', 'Causation is impossible to measure', 'Correlation only works on categorical data'], correct: 1, explanation: 'Two correlated variables may both be driven by an unobserved confounding factor (e.g. ice cream sales and drowning rates both driven by temperature).', hint: 'Confounding third variable.', level: 6, difficulty: 'medium' },
          { question: 'What is the Coefficient of Variation (CV) and when is it used?', options: ['CV = Standard Deviation / Mean, used to compare relative dispersion across datasets with different units or scales', 'CV = Mean * Variance', 'CV = Range / Median', 'CV = IQR * 100'], correct: 0, explanation: 'CV standardizes dispersion relative to the mean, allowing comparison between e.g. stock volatility in USD vs Yen.', hint: 'Relative ratio of std dev to mean.', level: 7, difficulty: 'hard' },
          { question: 'What is Kurtosis in distribution analysis?', options: ['A measure of the skewness direction', 'A measure of the tailedness and outlier propensity (heaviness of tails) compared to a normal distribution', 'The sum of all medians', 'The sample size count'], correct: 1, explanation: 'Kurtosis measures whether data tails are heavy (leptokurtic) with outlier risk or light (platykurtic) relative to normal mesokurtic distribution.', hint: 'Measures tail weight and outlier propensity.', level: 7, difficulty: 'hard' },
          { question: 'According to Chebyshev Inequality, what is the minimum proportion of data within k standard deviations (k > 1) for ANY distribution shape?', options: ['1 - (1 / k²)', '1 / k', 'k / (k + 1)', '50%'], correct: 0, explanation: 'Chebyshev theorem guarantees at least (1 - 1/k²) of observations fall within k std devs regardless of distribution shape.', hint: '1 - (1 / k^2).', level: 8, difficulty: 'hard' },
          { question: 'What is the Central Limit Theorem (CLT) guarantee regarding the distribution of sample means?', options: ['All populations are normally distributed', 'The sampling distribution of sample means approaches a normal distribution as sample size n grows (n >= 30), regardless of population shape', 'Sample variance equals zero', 'Sample mean is always integer'], correct: 1, explanation: 'CLT states that sums/averages of independent random variables converge to a Gaussian normal distribution as n increases.', hint: 'Sample means converge to normal distribution.', level: 8, difficulty: 'hard' }
        ]
      },

      // 3.2 EDA & Preprocessing
      {
        title: 'Exploratory Data Analysis & Data Preprocessing Pipeline',
        topicName: 'EDA & Preprocessing',
        difficulty: 'MEDIUM',
        transcript: `Topic: Exploratory Data Analysis (EDA), Missing Data Imputation, and Feature Scaling

1. Exploratory Data Analysis (EDA) Goals:
EDA is the critical data science step of analyzing dataset distributions, detecting anomalies, verifying assumptions, and uncovering patterns using statistical summaries and visual graphs.

2. Handling Missing Data:
- MCAR (Missing Completely at Random): Missingness has no relationship with any observed or unobserved variable.
- MAR (Missing at Random): Missingness is related to observed variables.
- MNAR (Missing Not at Random): Missingness is related to the unobserved value itself.
- Imputation Strategies:
  • Mean/Median Imputation: Replaces missing numerical values with median (robust to outliers).
  • Mode/Constant Imputation: Replaces missing categorical values.
  • KNN / Iterative Imputation: Predicts missing values based on similar feature rows.

3. Categorical Encoding:
- One-Hot Encoding: Converts categorical features into N binary columns (0 or 1). Drops one column to avoid dummy variable trap (multicollinearity).
- Label / Ordinal Encoding: Converts ordered categories into integer ranks (e.g. Low=0, Medium=1, High=2).

4. Feature Scaling:
- Standardization (Z-score Normalization): Transforms feature to have mean=0 and std=1 (z = (x - mu) / sigma). Preserves outliers; essential for linear models, SVM, PCA, and Logistic Regression.
- Min-Max Scaling (Normalization): Scales features into [0, 1] range: x_norm = (x - min) / (max - min). Sensitive to outliers; ideal for neural networks and image pixels.

5. Verified Educational References:
- Géron, "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", 3rd Edition, Chapter 2.
- McKinney, "Python for Data Analysis", 3rd Edition (pandas and numpy).`,
        summary: 'EDA cleans data, imputes missing values, encodes categories (One-Hot), and scales features (Standardization/MinMax) for robust machine learning pipelines.',
        bullets: [
          'EDA uncovers data distributions, correlations, outliers, and feature skews',
          'Missing data mechanisms: MCAR, MAR, and MNAR determine safe imputation strategy',
          'One-Hot Encoding creates binary indicator columns; drop first to prevent dummy variable trap',
          'Standardization (z = (x - mean) / std) sets mean=0, std=1; preserves outlier distribution',
          'Min-Max Normalization rescales features into [0, 1] range; sensitive to extreme outliers',
          'Data leakage is prevented by fitting scalers exclusively on the training set'
        ],
        keywords: [
          { term: 'One-Hot Encoding', definition: 'Representing categorical levels as individual binary (0/1) indicator columns.', importance: 5 },
          { term: 'Standardization', definition: 'Centering data to mean 0 and scaling to unit variance 1.', importance: 5 },
          { term: 'Data Leakage', definition: 'Inadvertently using test set statistics during training preprocessing.', importance: 5 },
          { term: 'Imputation', definition: 'Replacing missing values with statistical estimates.', importance: 4 }
        ],
        flashcards: [
          { front: 'Why must feature scalers be fit ONLY on the training dataset and not the full dataset?', back: 'To prevent Data Leakage, ensuring test data information never leaks into the model training pipeline.', hint: 'Fit on train, transform on test.' },
          { front: 'What is the Dummy Variable Trap in One-Hot Encoding?', back: 'A scenario where one-hot columns are perfectly collinear (sum equals 1), causing multicollinearity in linear models.', hint: 'Drop one dummy column.' }
        ],
        quizzes: [
          { question: 'Why is feature scaling necessary for distance-based algorithms like KNN and K-Means?', options: ['It makes data run in parallel', 'Features with large numerical ranges (e.g. salary 100,000) would dominate distance metrics over small features (e.g. age 25)', 'It converts numbers to strings', 'It deletes missing values'], correct: 1, explanation: 'Distance metrics compute Euclidean distance; unscaled large magnitude features overpower small magnitude features.', hint: 'Prevents large magnitude features from dominating distance.', level: 1, difficulty: 'easy' },
          { question: 'What is the formula for Min-Max Feature Scaling into the range [0, 1]?', options: ['x_scaled = x / 100', 'x_scaled = (x - x_min) / (x_max - x_min)', 'x_scaled = (x - mean) / std_dev', 'x_scaled = x * 2'], correct: 1, explanation: 'Min-Max normalization subtracts the minimum and divides by the range (max - min) to bound outputs between 0 and 1.', hint: '(x - min) / (max - min).', level: 1, difficulty: 'easy' },
          { question: 'What is the mean and standard deviation of a feature after applying Z-score Standardization?', options: ['Mean = 1, Std = 0', 'Mean = 0, Std = 1', 'Mean = 50, Std = 10', 'Mean = 100, Std = 15'], correct: 1, explanation: 'Standardization centers the feature distribution to a mean of exactly 0 and a standard deviation of 1.', hint: 'Mean 0, standard deviation 1.', level: 2, difficulty: 'easy' },
          { question: 'When encoding an ordinal category such as [Low, Medium, High], which encoding technique is most appropriate?', options: ['One-Hot Encoding', 'Ordinal / Integer Label Encoding (0, 1, 2)', 'Binary Hashing', 'Target Encoding'], correct: 1, explanation: 'Ordinal encoding assigns ordered integers (0, 1, 2), preserving the natural ranking between categories.', hint: 'Preserves ordered ranking.', level: 2, difficulty: 'easy' },
          { question: 'What is Data Leakage in a machine learning preprocessing pipeline?', options: ['A hacker stealing data', 'Information from the testing/validation set inadvertently leaking into the training pipeline during preprocessing', 'Memory leaking from RAM', 'Loss of precision in floating point numbers'], correct: 1, explanation: 'Fitting scalers or imputers on the entire dataset leaks test distribution knowledge into training, giving overly optimistic test scores.', hint: 'Test information leaking into training.', level: 3, difficulty: 'medium' },
          { question: 'Why should Median imputation be chosen over Mean imputation for numerical columns with strong skewness?', options: ['Median is faster to compute', 'Median is resistant to extreme outliers, whereas Mean is pulled by extreme values', 'Mean only works on integers', 'Median deletes the column'], correct: 1, explanation: 'Skewed data has outliers that distort the mean; the median provides a representative central value.', hint: 'Median is robust to outliers.', level: 3, difficulty: 'medium' },
          { question: 'What is the Dummy Variable Trap caused by One-Hot Encoding in Linear Regression models?', options: ['Infinite loops in Python', 'Perfect Multicollinearity (one dummy column can be perfectly predicted from the sum of others)', 'Underfitting of labels', 'Random seed failure'], correct: 1, explanation: 'If all k dummy columns are included, their sum equals the intercept column, causing singular matrix inversion failure.', hint: 'Perfect multicollinearity.', level: 4, difficulty: 'medium' },
          { question: 'How is the Dummy Variable Trap resolved when using One-Hot Encoding?', options: ['By deleting the target variable', 'By dropping one of the k binary dummy indicator columns (drop_first=True)', 'By multiplying columns by 2', 'By switching to decision trees only'], correct: 1, explanation: 'Dropping one baseline category leaves k - 1 independent indicator variables, restoring full rank matrix inversion.', hint: 'Drop one dummy column.', level: 4, difficulty: 'medium' },
          { question: 'Which visualization plot is most effective for inspecting the distribution, skewness, and outliers of a numerical feature simultaneously?', options: ['Pie Chart', 'Box Plot (Box-and-Whisker Plot)', 'Line Chart', 'Radar Chart'], correct: 1, explanation: 'Box plots display median, IQR box, whiskers, and individual outlier points cleanly.', hint: 'Box-and-whisker plot.', level: 5, difficulty: 'medium' },
          { question: 'What does a Correlation Heatmap displaying a Pearson coefficient of r = 0.98 between two independent features indicate?', options: ['Both features are useless', 'Severe Multicollinearity (one of the redundant features should likely be removed or combined)', 'The model is 98% accurate', 'The dataset is non-linear'], correct: 1, explanation: 'Two features with r=0.98 carry redundant information, inflating regression coefficient variance.', hint: 'High redundancy between features.', level: 5, difficulty: 'medium' },
          { question: 'What is Missing Completely at Random (MCAR) in missing data theory?', options: ['Data missing due to sensor failure at high temperatures', 'The probability of data missing is completely unrelated to both observed and unobserved data values', 'Data missing only for high income rows', 'Data missing in 50% of columns'], correct: 1, explanation: 'MCAR means missingness is purely random noise; discarding MCAR rows produces no systematic bias.', hint: 'Missingness is purely random.', level: 6, difficulty: 'medium' },
          { question: 'Which data transformation technique is commonly applied to right-skewed positive features to make their distribution more Gaussian/Normal?', options: ['Squaring the values (x²)', 'Log Transformation (log(1 + x)) or Box-Cox transformation', 'Multiplying by 100', 'One-Hot Encoding'], correct: 1, explanation: 'Logarithmic transformation compresses high extreme values, pulling right tails inward toward a symmetric bell shape.', hint: 'Log or Box-Cox transformation.', level: 6, difficulty: 'medium' },
          { question: 'When should RobustScaler (using median and IQR) be chosen over StandardScaler (using mean and std)?', options: ['When data has zero variance', 'When data contains extreme outliers that would distort mean and variance in StandardScaler', 'When dataset has less than 10 rows', 'When features are text strings'], correct: 1, explanation: 'RobustScaler subtracts the median and divides by IQR, preventing outliers from shrinking the inlier feature range.', hint: 'Uses median and IQR to ignore outliers.', level: 7, difficulty: 'hard' },
          { question: 'What is Target Encoding (Mean Encoding) for high-cardinality categorical variables and what is its primary risk?', options: ['Replacing categories with random numbers', 'Replacing categories with the average target value of that category; primary risk is severe Target Leakage and overfitting', 'Encoding text with ASCII values', 'Hashing passwords'], correct: 1, explanation: 'Target encoding replaces category strings with average target labels, risking overfitting if smoothing/K-fold out-of-fold regularization is not applied.', hint: 'Replaces category with average target value; risks overfitting.', level: 7, difficulty: 'hard' },
          { question: 'In Scikit-Learn pipelines, why is ColumnTransformer preferred over manual pandas transformations?', options: ['It uses C++ compiler directly', 'It encapsulates feature-specific transformations into a unified object, preventing data leakage during cross-validation', 'It converts pandas into SQL', 'It requires zero RAM'], correct: 1, explanation: 'ColumnTransformer ensures imputers and scalers fit strictly on CV training folds without manual data leakage errors.', hint: 'Encapsulates transforms cleanly within cross-validation.', level: 8, difficulty: 'hard' },
          { question: 'What is the curse of dimensionality during EDA and how does it affect distance calculations as feature count p grows?', options: ['Distances become zero', 'In high dimensions, all pairwise points become almost equidistant from each other, rendering distance-based heuristics ineffective', 'Memory consumption drops to 1 byte', 'Calculations become non-deterministic'], correct: 1, explanation: 'As dimensionality grows, volume expands exponentially and data points become sparse and equidistant, degrading KNN and distance metrics.', hint: 'All points become nearly equidistant in high dimensions.', level: 8, difficulty: 'hard' }
        ]
      },

      // 3.3 Linear Regression
      {
        title: 'Simple & Multiple Linear Regression — OLS & Diagnostics',
        topicName: 'Linear Regression & OLS',
        difficulty: 'MEDIUM',
        transcript: `Topic: Simple and Multiple Linear Regression, Ordinary Least Squares, and Model Diagnostics

1. Linear Regression Model Formulation:
Linear regression models the linear relationship between independent predictor variables X and a continuous target variable Y:
- Simple Linear Regression: Y = beta_0 + beta_1 * X + epsilon
- Multiple Linear Regression: Y = beta_0 + beta_1 * X_1 + beta_2 * X_2 + ... + beta_p * X_p + epsilon
- Matrix Notation: Y = X * beta + epsilon

2. Ordinary Least Squares (OLS) Optimization:
OLS finds coefficient weights beta that minimize the Residual Sum of Squares (RSS):
- RSS = sum((y_i - y_hat_i)²)
- Closed-form Normal Equation: beta = (X^T * X)^(-1) * X^T * Y
- Gradient Descent: Iteratively updates beta_j = beta_j - alpha * d(Cost)/d(beta_j) for large-scale datasets where matrix inversion is expensive.

3. Evaluation Metrics:
- R-squared (Coefficient of Determination): Proportion of variance in Y explained by predictors X (R² = 1 - (RSS / TSS)). Ranges [0, 1].
- Adjusted R-squared: Penalizes adding useless predictor features: Adj_R² = 1 - [(1 - R²) * (n - 1) / (n - p - 1)].
- Mean Squared Error (MSE): Average squared residual error.
- Root Mean Squared Error (RMSE): Square root of MSE, in the same measurement units as Y.
- Mean Absolute Error (MAE): Average absolute error |y - y_hat|, robust to outliers.

4. Gauss-Markov Classical Assumptions:
1. Linearity: Relationship between X and mean of Y is linear.
2. Homoscedasticity: Error terms epsilon have constant variance across all levels of X.
3. Independence: Residuals are independent (no autocorrelation).
4. Normality: Residuals are normally distributed with mean 0.
5. No Multicollinearity: Predictors are not perfectly linearly correlated.

5. Regularized Linear Regression:
- Ridge Regression (L2 Penalty): Adds lambda * sum(beta_j²) to loss. Shrinks coefficients close to zero; handles multicollinearity.
- Lasso Regression (L1 Penalty): Adds lambda * sum(|beta_j|) to loss. Drives coefficients to EXACTLY zero, performing automatic feature selection.
- ElasticNet: Combines both L1 and L2 penalties.

6. Verified Educational References:
- James et al. (ISLR), "An Introduction to Statistical Learning", Chapter 3 (Linear Regression).
- Hastie, Tibshirani, Friedman, "The Elements of Statistical Learning" (ESL), Chapter 3.`,
        summary: 'Linear regression models continuous targets using OLS. Evaluated via RMSE and Adjusted R². Regularized via Ridge (L2) and Lasso (L1).',
        bullets: [
          'Linear Regression predicts continuous Y: Y = X*beta + epsilon',
          'OLS minimizes Residual Sum of Squares (RSS); closed form: beta = (X^T X)^(-1) X^T Y',
          'R-squared measures explained variance; Adjusted R-squared penalizes redundant features',
          'Assumptions: Linearity, Homoscedasticity, Independence, Normality, and No Multicollinearity',
          'Ridge (L2) shrinks coefficients; Lasso (L1) enforces sparsity for feature selection',
          'Heteroscedasticity (funnel-shaped residuals) indicates non-constant error variance'
        ],
        keywords: [
          { term: 'Ordinary Least Squares', definition: 'Optimization method minimizing the sum of squared differences between observed and predicted values.', importance: 5 },
          { term: 'R-squared', definition: 'Proportion of total variance in the dependent variable explained by the regression model.', importance: 5 },
          { term: 'Lasso Regression', definition: 'L1 regularized regression performing automatic feature selection by zeroing coefficients.', importance: 5 },
          { term: 'Homoscedasticity', definition: 'Constant error variance assumption across all fitted values.', importance: 4 }
        ],
        flashcards: [
          { front: 'Why does Lasso regression (L1) create sparse models with zero coefficients while Ridge (L2) does not?', back: 'Lasso has diamond-shaped L1 constraint corners on axes where loss contours touch at exact zero values.', hint: 'Diamond L1 corners intersect axes at zero.' },
          { front: 'What does an R-squared of 0.85 mean?', back: '85% of the variance in the target variable Y is explained by the independent predictor features X.', hint: '85% of variance explained.' }
        ],
        quizzes: [
          { question: 'What cost function does Ordinary Least Squares (OLS) minimize to find optimal regression coefficients?', options: ['Mean Absolute Error (MAE)', 'Residual Sum of Squares (RSS = sum((y - y_hat)²))', 'Cross-Entropy Loss', 'Hinge Loss'], correct: 1, explanation: 'OLS minimizes the sum of squared vertical differences (residuals) between actual data points and regression line.', hint: 'Sum of squared residuals.', level: 1, difficulty: 'easy' },
          { question: 'What does an R-squared (R²) value of 1.0 indicate for a regression model?', options: ['The model has 100% error', 'The model fits data points perfectly with zero residual error (RSS = 0)', 'The model is completely random', 'All coefficients are equal to 1'], correct: 1, explanation: 'R² = 1 - (RSS / TSS); when RSS = 0, R² = 1.0, meaning 100% of variance is explained by the model.', hint: '100% of variance explained with 0 error.', level: 1, difficulty: 'easy' },
          { question: 'What is the closed-form Normal Equation solution for OLS weights beta?', options: ['beta = X * Y', 'beta = (X^T * X)^(-1) * X^T * Y', 'beta = X^T * (X * Y)', 'beta = Y / X'], correct: 1, explanation: 'Setting the derivative of RSS with respect to beta to zero yields the normal equation beta = (X^T X)^(-1) X^T Y.', hint: '(X^T X)^(-1) X^T Y.', level: 2, difficulty: 'easy' },
          { question: 'Why is Adjusted R-squared preferred over standard R-squared in Multiple Linear Regression?', options: ['Standard R-squared always increases when adding more features, even useless noise variables; Adjusted R-squared penalizes useless features', 'Adjusted R-squared works on classification', 'Standard R-squared cannot exceed 0.5', 'Adjusted R-squared ignores the intercept'], correct: 0, explanation: 'Standard R² mechanically increases with every added column; Adjusted R² includes a penalty term for feature count p.', hint: 'Penalizes useless noise features.', level: 2, difficulty: 'easy' },
          { question: 'What is Heteroscedasticity in linear regression residual diagnostics?', options: ['Residuals have equal variance', 'The variance of the error terms (residuals) is NOT constant across fitted values (e.g. fan/funnel shape)', 'Predictors are integers', 'R-squared is negative'], correct: 1, explanation: 'Heteroscedasticity violates the Gauss-Markov constant variance assumption, shown as funnel-shaped residual plots.', hint: 'Non-constant residual variance.', level: 3, difficulty: 'medium' },
          { question: 'How does Ridge Regression (L2 regularization) modify the standard OLS loss function?', options: ['By multiplying predictions by 2', 'By adding a penalty proportional to the sum of squared coefficients (lambda * sum(beta_j²))', 'By taking the absolute value of weights', 'By setting all weights to zero'], correct: 1, explanation: 'Ridge adds an L2 penalty lambda * sum(beta_j²) which shrinks coefficients toward zero to handle multicollinearity.', hint: 'L2 squared penalty term.', level: 3, difficulty: 'medium' },
          { question: 'What unique property does Lasso Regression (L1 regularization) have that Ridge does not?', options: ['Lasso runs faster', 'Lasso drives unimportant feature coefficients to EXACTLY zero, performing automatic feature selection', 'Lasso can only predict integers', 'Lasso does not use lambda'], correct: 1, explanation: 'The sharp geometric corners of the L1 penalty force non-informative feature weights to exact zero.', hint: 'Sets coefficients to exact zero.', level: 4, difficulty: 'medium' },
          { question: 'What is the Variance Inflation Factor (VIF) used to detect in multiple regression?', options: ['Overfitting in test sets', 'Multicollinearity among independent predictor variables (VIF > 5-10 indicates high multicollinearity)', 'Outlier residuals', 'Zero slope coefficients'], correct: 1, explanation: 'VIF measures how much the variance of an estimated regression coefficient is inflated due to collinearity with other predictors.', hint: 'Detects multicollinearity.', level: 4, difficulty: 'medium' },
          { question: 'What is the primary difference between RMSE and MAE evaluation metrics?', options: ['RMSE penalizes large outlier errors more heavily due to squaring residuals, while MAE treats errors linearly', 'MAE cannot be calculated on decimals', 'RMSE is always smaller than MAE', 'They are mathematically identical'], correct: 0, explanation: 'Squaring residuals in RMSE amplifies large mistakes, making RMSE sensitive to catastrophic outliers.', hint: 'RMSE squares errors, penalizing outliers heavily.', level: 5, difficulty: 'medium' },
          { question: 'In Gradient Descent optimization for linear regression, what happens if the learning rate alpha is set too large?', options: ['The algorithm converges in 1 step', 'The cost function diverges and oscillates uncontrollably, failing to reach the minimum', 'The weights freeze at 0', 'The computer reboots'], correct: 1, explanation: 'An overly large learning rate overshoots the minimum bowl, causing loss to explode to infinity.', hint: 'Overshoots and diverges.', level: 5, difficulty: 'medium' },
          { question: 'In a Q-Q (Quantile-Quantile) Plot of regression residuals, what pattern confirms that residuals are normally distributed?', options: ['A U-shaped curve', 'Residual points falling closely along a straight 45-degree reference diagonal line', 'A horizontal flat line', 'Points scattered randomly in all four corners'], correct: 1, explanation: 'In a Q-Q plot, theoretical normal quantiles plotted against sample residual quantiles form a straight line if normal.', hint: 'Points align on 45-degree diagonal line.', level: 6, difficulty: 'medium' },
          { question: 'If two features X1 and X2 have a correlation of r = 0.99, what happens to the OLS coefficient estimates beta_1 and beta_2?', options: ['They become zero', 'Their individual estimates become unstable with huge standard errors, even though overall R² remains high', 'Their sum equals 1', 'The model accuracy doubles'], correct: 1, explanation: 'Multicollinearity makes it impossible for OLS to isolate the individual effect of X1 holding X2 constant, inflating standard errors.', hint: 'Coefficients become unstable with high variance.', level: 6, difficulty: 'medium' },
          { question: 'What is Cooks Distance used to identify in regression diagnostics?', options: ['The distance between cities', 'Influential data points that exert disproportionate leverage on the estimated regression coefficients', 'The optimal learning rate', 'The number of iterations'], correct: 1, explanation: 'Cooks Distance measures how much all fitted values change when a specific i-th observation is deleted.', hint: 'Identifies influential leverage points.', level: 7, difficulty: 'hard' },
          { question: 'Why does ElasticNet regression outperform Lasso when predictor features are highly correlated (p > n)?', options: ['ElasticNet ignores all data', 'Lasso arbitrarily selects only one feature from a correlated group, whereas ElasticNet groups and retains correlated features via L1+L2 balance', 'ElasticNet is non-linear', 'ElasticNet disables gradient descent'], correct: 1, explanation: 'ElasticNet combines L1 sparsity with L2 grouped shrinkage, overcoming Lasso instability on correlated features.', hint: 'Combines L1 and L2 to group correlated features.', level: 7, difficulty: 'hard' },
          { question: 'What is the Gauss-Markov Theorem conclusion regarding the OLS estimator beta_hat?', options: ['OLS is the fastest algorithm', 'Under classical assumptions, OLS is the Best Linear Unbiased Estimator (BLUE) with minimum variance among all linear unbiased estimators', 'OLS has zero error', 'OLS works on any non-linear data'], correct: 1, explanation: 'The Gauss-Markov theorem proves OLS is BLUE (Best Linear Unbiased Estimator).', hint: 'BLUE: Best Linear Unbiased Estimator.', level: 8, difficulty: 'hard' },
          { question: 'How is Polynomial Regression implemented using standard Linear Regression algorithms?', options: ['By creating new non-linear feature columns (e.g. X², X³) and fitting standard linear OLS on the expanded feature space', 'By changing OLS to neural networks', 'By taking square roots of targets only', 'By disabling the intercept term'], correct: 0, explanation: 'Polynomial regression is linear in parameters beta; expanding X into polynomial powers allows standard OLS to fit curves.', hint: 'Linear in parameters beta over transformed feature powers.', level: 8, difficulty: 'hard' }
        ]
      },

      // 3.4 Logistic Regression
      {
        title: 'Logistic Regression & Binary Classification — Sigmoid & ROC-AUC',
        topicName: 'Logistic Regression',
        difficulty: 'MEDIUM',
        transcript: `Topic: Logistic Regression, Odds Ratios, Cross-Entropy Loss, and Classification Metrics

1. Logistic Regression Model Principle:
Logistic regression models the probability that an observation belongs to a particular binary category (Y in {0, 1}).
- Sigmoid (Logistic) Activation Function: sigma(z) = 1 / (1 + exp(-z)), where z = beta_0 + beta_1 * X_1 + ... + beta_p * X_p.
- Maps any real-valued linear input z in (-infinity, +infinity) to a bounded probability P(Y=1|X) in [0, 1].

2. Odds and Log-Odds (Logit):
- Odds Ratio: Odds = P / (1 - P)
- Logit Function: ln(P / (1 - P)) = beta_0 + beta_1 * X_1 + ... + beta_p * X_p
- Interpretation: A unit increase in X_j multiplies the odds of success by exp(beta_j).

3. Loss Function: Binary Cross-Entropy (Log Loss):
OLS cannot be used for logistic regression because squared error on probabilities creates a non-convex loss surface with local minima. Instead, Maximum Likelihood Estimation (MLE) minimizes Log Loss:
- Loss = - (1/N) * sum[ y_i * log(p_i) + (1 - y_i) * log(1 - p_i) ]

4. Classification Evaluation Metrics:
- Confusion Matrix: True Positives (TP), True Negatives (TN), False Positives (FP), False Negatives (FN).
- Accuracy: (TP + TN) / Total. Misleading in imbalanced datasets.
- Precision: TP / (TP + FP). Proportion of positive predictions that were correct (crucial for spam detection).
- Recall (Sensitivity): TP / (TP + FN). Proportion of actual positives correctly identified (crucial for cancer detection).
- F1-Score: Harmonic mean of Precision and Recall: F1 = 2 * (Precision * Recall) / (Precision + Recall).
- ROC Curve & AUC: Plots True Positive Rate (Recall) vs False Positive Rate (FPR = FP / (FP + TN)) across all classification thresholds. AUC = 1.0 is perfect; AUC = 0.5 is random coin flip.

5. Verified Educational References:
- James et al. (ISLR), Chapter 4 (Classification).
- Hosmer, Lemeshow, Sturdivant, "Applied Logistic Regression", 3rd Edition.`,
        summary: 'Logistic regression maps linear combinations to probabilities using the Sigmoid function. Optimized via Log Loss and evaluated via Precision, Recall, and ROC-AUC.',
        bullets: [
          'Sigmoid function sigma(z) = 1 / (1 + e^(-z)) squashes outputs into probability range [0, 1]',
          'Logit function ln(p / (1 - p)) models the linear log-odds of the positive class',
          'Optimized via Maximum Likelihood Estimation (Binary Cross-Entropy Log Loss)',
          'Precision = TP / (TP + FP) measures exactness; Recall = TP / (TP + FN) measures completeness',
          'F1-Score is the harmonic mean of Precision and Recall',
          'ROC Curve plots TPR vs FPR across thresholds; AUC measures discriminative power'
        ],
        keywords: [
          { term: 'Sigmoid Function', definition: 'S-shaped mathematical activation mapping real inputs to [0, 1] probabilities.', importance: 5 },
          { term: 'Log Loss', definition: 'Cross-entropy loss function measuring probability prediction error in classification.', importance: 5 },
          { term: 'ROC-AUC', definition: 'Area Under Receiver Operating Characteristic Curve measuring threshold-independent ranking power.', importance: 5 },
          { term: 'Precision and Recall', definition: 'Metrics balancing false positives vs false negatives in classification.', importance: 5 }
        ],
        flashcards: [
          { front: 'Why is Mean Squared Error not used to train Logistic Regression models?', back: 'Because applying MSE to the non-linear Sigmoid function results in a non-convex loss function with many local minima.', hint: 'Non-convex loss surface.' },
          { front: 'What is the difference between Precision and Recall?', back: 'Precision measures how many predicted positives were true (TP / (TP+FP)); Recall measures how many real positives were caught (TP / (TP+FN)).', hint: 'Exactness vs completeness.' }
        ],
        quizzes: [
          { question: 'What mathematical function does Logistic Regression use to map real numbers into probabilities between 0 and 1?', options: ['RelU Function', 'Sigmoid (Logistic) Function: sigma(z) = 1 / (1 + e^(-z))', 'Step Function', 'Linear Function'], correct: 1, explanation: 'The Sigmoid function squashes any real value z into the bounded probability range [0, 1].', hint: '1 / (1 + e^-z).', level: 1, difficulty: 'easy' },
          { question: 'What is the default decision threshold probability in binary logistic regression classification?', options: ['0.0', '0.5 (50%)', '0.75', '1.0'], correct: 1, explanation: 'By default, predicted probabilities >= 0.5 are classified as class 1, and < 0.5 as class 0.', hint: '50% midpoint threshold.', level: 1, difficulty: 'easy' },
          { question: 'What loss function is minimized in Logistic Regression using Maximum Likelihood Estimation?', options: ['Mean Squared Error (MSE)', 'Binary Cross-Entropy Loss (Log Loss)', 'Hinge Loss', 'L1 Absolute Loss'], correct: 1, explanation: 'Binary cross-entropy (Log Loss) provides a convex optimization surface for gradient descent in logistic regression.', hint: 'Binary cross-entropy / Log Loss.', level: 2, difficulty: 'easy' },
          { question: 'In a medical diagnosis test for a fatal disease, which metric is most critical to maximize to avoid missing infected patients?', options: ['Accuracy', 'Recall (Sensitivity)', 'Precision', 'Specificity'], correct: 1, explanation: 'Recall (TP / (TP + FN)) minimizes False Negatives; missing a diseased patient is fatal, making high recall critical.', hint: 'Minimizes False Negatives.', level: 2, difficulty: 'easy' },
          { question: 'What is the formula for Precision in classification evaluation?', options: ['Precision = TP / (TP + FP)', 'Precision = TP / (TP + FN)', 'Precision = TN / (TN + FP)', 'Precision = (TP + TN) / Total'], correct: 0, explanation: 'Precision is the proportion of positive predictions that were truly positive: TP / (TP + FP).', hint: 'TP / (TP + FP).', level: 3, difficulty: 'medium' },
          { question: 'Why is Accuracy a misleading metric for highly imbalanced datasets (e.g. 99% non-fraud, 1% fraud)?', options: ['Accuracy cannot be computed on decimals', 'A naive model predicting non-fraud 100% of the time achieves 99% accuracy while detecting zero fraud cases', 'Accuracy is only for regression', 'Accuracy requires GPU memory'], correct: 1, explanation: 'In skewed datasets, predicting the majority class yields high accuracy while completely failing the minority class of interest.', hint: 'A dummy model predicting all majority gets 99%.', level: 3, difficulty: 'medium' },
          { question: 'What is the F1-Score in machine learning evaluation?', options: ['The arithmetic mean of accuracy and error', 'The Harmonic Mean of Precision and Recall: 2 * (P * R) / (P + R)', 'The square of AUC', 'The count of true negatives'], correct: 1, explanation: 'The harmonic mean gives a balanced score between precision and recall, penalizing extreme trade-offs heavily.', hint: 'Harmonic mean of precision and recall.', level: 4, difficulty: 'medium' },
          { question: 'What two rates are plotted on the X and Y axes of a Receiver Operating Characteristic (ROC) Curve?', options: ['X: False Positive Rate (1 - Specificity), Y: True Positive Rate (Recall / Sensitivity)', 'X: Accuracy, Y: Precision', 'X: Loss, Y: Epochs', 'X: Mean, Y: Variance'], correct: 0, explanation: 'The ROC curve displays True Positive Rate (TPR) on the y-axis versus False Positive Rate (FPR) on the x-axis across all thresholds.', hint: 'TPR vs FPR across all thresholds.', level: 4, difficulty: 'medium' },
          { question: 'What does an Area Under the ROC Curve (ROC-AUC) score of 0.5 indicate?', options: ['Perfect classification accuracy', 'Performance equal to random guessing (a coin flip)', 'Zero false positives', 'The model is 100% biased'], correct: 1, explanation: 'An AUC of 0.5 represents the diagonal chance line with zero discriminative ability between classes.', hint: 'Equal to a random coin flip.', level: 5, difficulty: 'medium' },
          { question: 'How is the coefficient beta_j interpreted in Logistic Regression in terms of Odds Ratio?', options: ['Adding 1 to X_j increases Y by beta_j', 'Each unit increase in X_j multiplies the odds of the positive outcome by exp(beta_j)', 'beta_j is the probability', 'beta_j is the standard deviation'], correct: 1, explanation: 'Because log(odds) = X*beta, exponentiating shows that a unit increase in X_j multiplies the odds by e^(beta_j).', hint: 'Multiplies odds by e^beta_j.', level: 5, difficulty: 'medium' },
          { question: 'What happens if you lower the classification decision threshold from 0.5 to 0.2 in a spam filter model?', options: ['Precision increases and Recall decreases', 'Recall increases (more spam caught) but Precision decreases (more false alarms in legitimate mail)', 'Both Precision and Recall reach 1.0', 'No change occurs'], correct: 1, explanation: 'Lowering the threshold makes the model more aggressive at predicting positive, raising Recall but lowering Precision.', hint: 'Catches more positives at cost of false alarms.', level: 6, difficulty: 'medium' },
          { question: 'What is the Multiclass extension of Logistic Regression called when classifying K > 2 mutually exclusive classes?', options: ['K-Means Classifier', 'Multinomial Logistic Regression (Softmax Regression)', 'Linear Discriminant Matrix', 'Decision Forest'], correct: 1, explanation: 'Softmax regression computes normalized exponential probability distributions over K classes simultaneously.', hint: 'Softmax regression.', level: 6, difficulty: 'medium' },
          { question: 'What is Perfect Separation in Logistic Regression and what numerical problem does it cause during training?', options: ['The model runs out of memory', 'A feature perfectly divides classes, causing OLS/MLE coefficients to diverge to infinity (+/- infinity)', 'Loss becomes negative', 'All probabilities become 0.5'], correct: 1, explanation: 'When a line perfectly separates classes without overlap, the log-odds slope beta must approach infinity to make probability 1.0.', hint: 'Coefficients explode to infinity.', level: 7, difficulty: 'hard' },
          { question: 'How does L2 regularization (Ridge penalty) resolve the infinite coefficient divergence caused by perfect separation?', options: ['By deleting the data points', 'By penalizing large coefficient magnitudes, bounding weights to finite values and smoothing decision boundaries', 'By setting all probabilities to 0', 'By running PCA first'], correct: 1, explanation: 'The L2 weight penalty prevents coefficients from exploding to infinity, ensuring numerical stability.', hint: 'Penalizes large weights to keep them finite.', level: 7, difficulty: 'hard' },
          { question: 'What is Calibration in probabilistic classification models and how does Brier Score evaluate it?', options: ['Calibration measures training speed', 'Calibration measures whether a predicted 80% probability actually occurs 80% of the time; Brier Score computes MSE on predicted probabilities', 'Calibration measures image resolution', 'Calibration is only for regression'], correct: 1, explanation: 'Well-calibrated probabilities reflect true observed frequencies; Brier Score calculates the mean squared error between probabilities and binary labels.', hint: 'Predicted probabilities matching real-world frequencies.', level: 8, difficulty: 'hard' },
          { question: 'Why is the Precision-Recall (PR) Curve preferred over the ROC Curve when evaluating severely imbalanced datasets (e.g. fraud 0.01%)?', options: ['ROC curve is computationally impossible', 'ROC curves give an overly optimistic visual assessment because huge True Negative counts keep FPR deceptively small, whereas PR curves focus purely on positive minority class', 'PR curve has no thresholds', 'PR curve is only for continuous variables'], correct: 1, explanation: 'A massive True Negative count masks false alarms in the ROC FPR denominator; PR curves isolate precision against recall directly.', hint: 'Large true negatives distort ROC curve.', level: 8, difficulty: 'hard' }
        ]
      },

      // 3.5 Clustering & PCA
      {
        title: 'Unsupervised Learning — K-Means Clustering & PCA',
        topicName: 'Clustering & PCA',
        difficulty: 'HARD',
        transcript: `Topic: Unsupervised Learning, K-Means Clustering, and Principal Component Analysis (PCA)

1. Unsupervised Learning Overview:
Unsupervised learning algorithms find hidden patterns, groupings, and low-dimensional representations in unlabelled data (no target Y).

2. K-Means Clustering Algorithm:
- Goal: Partition N observations into K distinct, non-overlapping clusters where each point belongs to the cluster with the nearest mean centroid.
- Objective: Minimize Within-Cluster Sum of Squares (Inertia / WCSS): WCSS = sum_{k=1}^K sum_{x in C_k} ||x - mu_k||².
- Lloyd's Iterative Algorithm:
  1. Initialize K cluster centroids randomly (or via K-Means++).
  2. Assignment Step: Assign each data point to its closest centroid using Euclidean distance.
  3. Update Step: Recompute each centroid mu_k as the mean of all points assigned to that cluster.
  4. Repeat until centroids converge (no changes in assignment).
- Determining Optimal K:
  • Elbow Method: Plots WCSS vs K; selects the inflection "elbow" point.
  • Silhouette Score: Measures how similar a point is to its own cluster (cohesion a) vs nearest neighboring cluster (separation b): s = (b - a) / max(a, b). Ranges [-1, +1].

3. K-Means Limitations:
- Sensitive to initial centroid placement (solved by K-Means++ smart probabilistic seeding).
- Assumes spherical clusters of similar size and density; fails on non-convex or elongated shapes (use DBSCAN or Gaussian Mixture Models instead).
- Outliers distort centroid mean positions.

4. Principal Component Analysis (PCA):
- Goal: Linear dimensionality reduction technique projecting data from D dimensions onto M orthogonal directions (M < D) that maximize retained variance.
- Mathematical Steps:
  1. Standardize dataset (mean=0, variance=1).
  2. Compute Covariance Matrix: Sigma = (1/N) * (X^T * X).
  3. Compute Eigenvectors and Eigenvalues of the Covariance Matrix.
  4. Sort Eigenvectors in descending order of their corresponding Eigenvalues.
  5. Select top M eigenvectors as Principal Components and project data: Z = X * W.
- Explained Variance Ratio: Proportion of total dataset variance captured by each principal component (lambda_i / sum(lambda)).

5. Verified Educational References:
- James et al. (ISLR), Chapter 10 (Unsupervised Learning).
- Jolliffe, "Principal Component Analysis", 2nd Edition, Springer.`,
        summary: 'K-Means partitions unlabelled data by minimizing WCSS around K centroids. PCA projects data onto orthogonal eigenvectors of the covariance matrix to maximize explained variance.',
        bullets: [
          'K-Means iteratively alternates between point assignment and centroid mean updates',
          'Inertia (WCSS) measures compactness; Silhouette score evaluates cluster cohesion vs separation',
          'K-Means++ initializes distant centroids to prevent poor local minimum convergence',
          'PCA finds orthogonal directions (eigenvectors) that maximize variance of projected data',
          'Covariance matrix decomposition yields eigenvalues proportional to explained variance',
          'Feature standardization is mandatory before PCA so high-magnitude features do not artificially dominate'
        ],
        keywords: [
          { term: 'Inertia / WCSS', definition: 'Within-Cluster Sum of Squares measuring total squared distance from points to centroids.', importance: 5 },
          { term: 'Silhouette Score', definition: 'Metric in [-1, +1] measuring how well-separated clusters are.', importance: 5 },
          { term: 'Eigenvector', definition: 'Direction vector whose orientation is unchanged by linear transformation, defining principal components.', importance: 5 },
          { term: 'Dimensionality Reduction', definition: 'Transforming high-dimensional data into fewer dimensions while preserving variance.', importance: 5 }
        ],
        flashcards: [
          { front: 'Why must data be standardized (mean=0, std=1) before running PCA?', back: 'Because PCA maximizes variance; unscaled features with large numerical ranges (e.g. income in thousands) would artificially dominate the principal components over small features.', hint: 'Prevents large variance features from dominating.' },
          { front: 'What is the Silhouette Score range and what does a score close to +1 indicate?', back: 'Range is [-1, +1]. A score near +1 indicates points are compact in their own cluster and well-separated from neighboring clusters.', hint: 'High cohesion and high separation.' }
        ],
        quizzes: [
          { question: 'What is the objective cost function that the K-Means clustering algorithm minimizes?', options: ['Binary Cross-Entropy', 'Within-Cluster Sum of Squares (Inertia / WCSS)', 'Mean Absolute Error', 'Hinge Loss'], correct: 1, explanation: 'K-Means minimizes the sum of squared Euclidean distances between each point and its assigned cluster centroid (WCSS).', hint: 'Within-Cluster Sum of Squares.', level: 1, difficulty: 'easy' },
          { question: 'What is the primary goal of Principal Component Analysis (PCA)?', options: ['To predict continuous target values', 'To reduce the dimensionality of a dataset while retaining as much variance as possible', 'To generate synthetic image data', 'To classify text documents'], correct: 1, explanation: 'PCA projects high-dimensional data onto orthogonal axes that capture maximum variance, compressing feature space.', hint: 'Dimensionality reduction maximizing variance.', level: 1, difficulty: 'easy' },
          { question: 'How does K-Means++ improve upon standard random centroid initialization?', options: ['By testing every single point', 'By choosing initial centroids probabilistically proportional to their squared distance from existing centroids to keep them well-spread', 'By running supervised regression first', 'By setting all centroids to zero'], correct: 1, explanation: 'K-Means++ spreads initial centroids far apart across the data space, preventing poor local convergence.', hint: 'Spreads initial centroids far apart.', level: 2, difficulty: 'easy' },
          { question: 'What graphical technique is commonly used to choose the number of clusters K in K-Means by finding the point of diminishing returns?', options: ['Scatter plot', 'Elbow Method (plotting WCSS vs K)', 'Pie chart', 'Q-Q plot'], correct: 1, explanation: 'The Elbow Method plots WCSS against K; the inflection point where reduction sharply flattens indicates optimal K.', hint: 'The elbow inflection point.', level: 2, difficulty: 'easy' },
          { question: 'What does a Silhouette Score of s = +0.85 indicate for a clustered dataset?', options: ['Clusters are heavily overlapping and incorrect', 'Data points are well-clustered, compact within their cluster and well-separated from other clusters', 'The model has 85% supervised accuracy', 'The number of clusters K is too high'], correct: 1, explanation: 'Silhouette scores close to +1.0 indicate excellent cohesion within clusters and strong separation between clusters.', hint: 'Well-clustered and distinct.', level: 3, difficulty: 'medium' },
          { question: 'Why is feature standardization mandatory before applying Principal Component Analysis (PCA)?', options: ['PCA only runs on integers', 'Unscaled features with large numerical variances will artificially dominate the first principal components', 'Standardization removes missing values', 'PCA requires zero values only'], correct: 1, explanation: 'PCA seeks directions of maximum variance; without scaling, features with large units (e.g. salary) dominate smaller features (e.g. age).', hint: 'Prevents large magnitude features from dominating variance.', level: 3, difficulty: 'medium' },
          { question: 'In PCA, what do the Eigenvectors and Eigenvalues of the data Covariance Matrix represent?', options: ['Eigenvectors represent the orthogonal principal component directions; Eigenvalues represent the amount of variance explained along each direction', 'Eigenvectors are data labels; Eigenvalues are cluster counts', 'They are error residuals', 'They represent training epochs'], correct: 0, explanation: 'Eigenvectors define the direction of the new axes; their corresponding eigenvalues quantify the variance spread along those axes.', hint: 'Eigenvectors = directions; Eigenvalues = variance magnitude.', level: 4, difficulty: 'medium' },
          { question: 'What is the geometric relationship between all Principal Components (PC1, PC2, PC3, ...) in PCA?', options: ['They are parallel to each other', 'They are strictly Orthogonal (perpendicular / uncorrelated) to each other', 'They intersect at 45 degrees', 'They form a circular loop'], correct: 1, explanation: 'Principal components are mutually orthogonal, ensuring zero linear correlation between the extracted feature dimensions.', hint: 'Mutually perpendicular and uncorrelated.', level: 4, difficulty: 'medium' },
          { question: 'Under what data distribution shape does standard K-Means clustering fail dramatically?', options: ['Spherical isotropic blobs', 'Non-convex, concentric circles, or elongated manifold shapes', 'Equally sized circular groups', '2D Gaussian distributions'], correct: 1, explanation: 'K-Means assumes convex spherical clusters with equal variance; it fails on complex shapes like concentric rings (DBSCAN is needed).', hint: 'Non-convex or concentric ring shapes.', level: 5, difficulty: 'medium' },
          { question: 'What is the Cumulative Explained Variance ratio in PCA used for?', options: ['To count number of rows', 'To determine how many principal components to keep (e.g. retaining enough components to capture >= 95% of total variance)', 'To compute loss gradients', 'To check for outliers'], correct: 1, explanation: 'Summing explained variance ratios identifies the minimum number of components needed to preserve e.g. 95% of information.', hint: 'Selecting components to keep 95% variance.', level: 5, difficulty: 'medium' },
          { question: 'How does DBSCAN (Density-Based Spatial Clustering) differ fundamentally from K-Means?', options: ['DBSCAN requires specifying K in advance', 'DBSCAN discovers clusters of arbitrary non-linear shapes based on point density (eps and min_samples) and explicitly marks outliers as noise', 'DBSCAN uses centroids', 'DBSCAN is supervised'], correct: 1, explanation: 'DBSCAN groups dense neighborhoods without requiring pre-set K and labels isolated sparse points as noise (-1).', hint: 'Density-based clustering with noise detection.', level: 6, difficulty: 'medium' },
          { question: 'What is Hierarchical Agglomerative Clustering and what visual diagram illustrates its nested cluster merging history?', options: ['Histogram', 'Dendrogram', 'Box Plot', 'ROC Curve'], correct: 1, explanation: 'Agglomerative clustering merges closest clusters bottom-up; a Dendrogram tree visualizes the full hierarchical merge history.', hint: 'Dendrogram tree diagram.', level: 6, difficulty: 'medium' },
          { question: 'What is the mathematical connection between Singular Value Decomposition (SVD) and Principal Component Analysis (PCA)?', options: ['They are completely unrelated', 'Applying SVD (X = U * S * V^T) directly on centered data matrix X yields right singular vectors V identical to PCA eigenvectors, avoiding expensive covariance matrix computation', 'SVD only works on square matrices', 'PCA is faster than SVD always'], correct: 1, explanation: 'SVD computes principal components directly on centered matrix X without forming the huge X^T X covariance matrix.', hint: 'Right singular vectors V equal PCA eigenvectors.', level: 7, difficulty: 'hard' },
          { question: 'What is the Davies-Bouldin Index in cluster evaluation and do you seek a high or low score?', options: ['Higher is better', 'Lower is better: it measures average similarity between each cluster and its most similar one (lower indicates compact and well-separated clusters)', 'Score must be exactly zero', 'Score is in percentage'], correct: 1, explanation: 'The Davies-Bouldin index evaluates cluster dispersion against inter-cluster separation; lower values signify superior clustering.', hint: 'Lower value indicates better separation.', level: 7, difficulty: 'hard' },
          { question: 'Why does K-Means converge to a Local Minimum rather than guaranteeing a Global Minimum?', options: ['Because Lloyd algorithm is a non-convex greedy optimization dependent on initial centroid positions', 'Because computers use floating point numbers', 'Because clusters must be 3D', 'Because variance cannot be calculated'], correct: 0, explanation: 'The discrete assignment problem is NP-hard; Lloyd algorithm performs greedy step-wise descent into the nearest local basin of attraction.', hint: 'Greedy non-convex optimization.', level: 8, difficulty: 'hard' },
          { question: 'What is t-SNE (t-Distributed Stochastic Neighbor Embedding) and why is it preferred over PCA for non-linear high-dimensional data visualization in 2D?', options: ['t-SNE runs in O(1) time', 't-SNE preserves local non-linear neighborhood manifold structures using Student-t probability distributions, whereas PCA is strictly linear', 't-SNE performs regression', 't-SNE is deterministic'], correct: 1, explanation: 't-SNE captures complex non-linear cluster relationships in 2D/3D embeddings where linear PCA projection overlaps manifolds.', hint: 'Preserves non-linear local neighborhood structure.', level: 8, difficulty: 'hard' }
        ]
      }
    ]
  }
];
