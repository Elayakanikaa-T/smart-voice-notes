// Comprehensive Curriculum Knowledge Base for Smart Voice Note Application
// 3 Core Subjects, 15 Foundational Topics, each with full lecture notes and 16-question 8-level question banks.

export interface CurriculumQuestion {
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
  hint: string;
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CurriculumTopic {
  title: string;
  topicName: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  transcript: string;
  summary: string;
  bullets: string[];
  keywords: Array<{ term: string; definition: string; importance: number }>;
  flashcards: Array<{ front: string; back: string; hint?: string }>;
  quizzes: CurriculumQuestion[];
}

export interface CurriculumSubject {
  name: string;
  code: string;
  color: string;
  icon: string;
  description: string;
  topics: CurriculumTopic[];
}

export const CURRICULUM_SUBJECTS: CurriculumSubject[] = [
  // =========================================================================
  // SUBJECT 1: DATA STRUCTURES & ALGORITHMS
  // =========================================================================
  {
    name: 'Data Structures',
    code: 'data_structures',
    color: '#6366F1',
    icon: '🗂️',
    description: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, and Algorithm Complexity',
    topics: [
      // ---------------------------------------------------------------------
      // Topic 1.1: Arrays & Dynamic Arrays
      // ---------------------------------------------------------------------
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
          { front: 'Why is dynamic array append amortized O(1) instead of O(n)?', back: 'Because the expensive O(n) doubling happens exponentially less often as the array grows.', hint: 'Consider aggregate analysis across N insertions.' },
          { front: 'What is the time complexity of deleting the first element in an array of size n?', back: 'O(n) time because all remaining (n - 1) elements must shift left by one slot.', hint: 'Consider what happens to memory holes at index 0.' }
        ],
        quizzes: [
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'What is the primary architectural requirement that allows arrays to achieve O(1) random access?',
            options: ['Elements are linked via pointers', 'Memory is allocated contiguously in physical address space', 'Elements are pre-sorted in ascending order', 'The array is stored inside CPU registers only'],
            correct: 1,
            explanation: 'Contiguous memory layout allows the CPU to calculate any element address instantly using base address plus index offset.',
            hint: 'Think about how memory slots are laid out adjacent to each other.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'In a 0-indexed array with base address 1000 and 4-byte integers, what is the memory address of the element at index 3?',
            options: ['1003', '1004', '1012', '1016'],
            correct: 2,
            explanation: 'Address = 1000 + (3 * 4) = 1012. Base plus index multiplied by data size.',
            hint: 'Multiply the index by the number of bytes per element, then add the base.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Identification & Basic Operations (Q3 - Q4)
          {
            question: 'What is the worst-case time complexity of inserting an item at the beginning (index 0) of a static array of size n?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            correct: 2,
            explanation: 'Inserting at index 0 requires shifting all n existing elements one position to the right, taking O(n) operations.',
            hint: 'Every single existing element must move to make space at the front.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'Which standard library container is an example of a dynamic array?',
            options: ['std::list in C++', 'std::vector in C++', 'LinkedList in Java', 'TreeSet in Java'],
            correct: 1,
            explanation: 'std::vector in C++ and ArrayList in Java are canonical implementations of dynamic arrays.',
            hint: 'Look for the resizable vector/array container.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Concept Understanding & Resizing (Q5 - Q6)
          {
            question: 'When a dynamic array exceeds its capacity, what resizing strategy is commonly used to maintain amortized O(1) append time?',
            options: ['Increment capacity by +1 element', 'Double the capacity (2x geometric growth)', 'Square the capacity (n²)', 'Divide capacity in half'],
            correct: 1,
            explanation: 'Geometric doubling (2x) ensures that the total copying work across N insertions sums to less than 2N, giving amortized O(1) cost.',
            hint: 'Linear growth by +1 would result in O(n²) total time; geometric expansion avoids this.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'Why do arrays have superior cache performance compared to linked lists?',
            options: ['Arrays use smaller memory pointers per node', 'Contiguous memory layout exhibits strong spatial locality for CPU caches', 'Arrays do not use RAM', 'Arrays run on GPU cores exclusively'],
            correct: 1,
            explanation: 'CPUs load memory in 64-byte cache lines; reading an array element automatically pre-fetches neighboring elements into cache.',
            hint: 'Consider how hardware cache pre-fetchers read adjacent memory blocks.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Mechanism Tracing (Q7 - Q8)
          {
            question: 'If a dynamic array starts with capacity 1 and doubles whenever full, how many total element copy operations occur while inserting 9 elements?',
            options: ['8 copies', '15 copies', '20 copies', '36 copies'],
            correct: 1,
            explanation: 'Resizes occur when inserting element 2 (1 copy), element 3 (2 copies), element 5 (4 copies), and element 9 (8 copies). Total copies = 1 + 2 + 4 + 8 = 15.',
            hint: 'Sum the powers of 2 for each resize event up to the 9th insertion.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'What is the time complexity of finding the maximum element in an unsorted array of n integers?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correct: 2,
            explanation: 'Without order, every element must be inspected at least once, requiring O(n) linear scans.',
            hint: 'You cannot skip elements without prior ordering.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Problem Solving & Tradeoffs (Q9 - Q10)
          {
            question: 'Suppose you need to frequently insert elements at index 0 and rarely access elements by random index. Which data structure is best?',
            options: ['Dynamic Array', 'Singly Linked List', 'Static Array', 'Binary Heap'],
            correct: 1,
            explanation: 'A linked list can insert at head in O(1) without shifting, whereas an array takes O(n) shifts.',
            hint: 'Which structure updates a single pointer instead of shifting all memory?',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'What happens to existing pointers or references to array elements when a dynamic array resizes?',
            options: ['They remain valid and update automatically', 'They become invalid (dangling pointers) because memory was reallocated elsewhere', 'They are promoted to register variables', 'They are converted to hash keys'],
            correct: 1,
            explanation: 'Reallocation creates a new heap block and frees the old one, invalidating all raw pointers to old elements.',
            hint: 'The old buffer is deallocated after data is copied.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: Scenario-Based Analysis (Q11 - Q12)
          {
            question: 'In a real-time audio application requiring guaranteed latency under 1 millisecond per sample insertion, why might a standard dynamic array be risky?',
            options: ['Array indexing is non-deterministic', 'Occasional O(n) resize pauses violate hard real-time latency bounds', 'Arrays consume too much CPU power', 'Audio samples cannot be stored in numbers'],
            correct: 1,
            explanation: 'While average time is O(1), worst-case single resize operations take O(n), causing unpredictable audio buffer underrun latency spikes.',
            hint: 'Consider the difference between average (amortized) latency and single-operation worst-case latency.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'What is the space overhead of a dynamic array of capacity C holding N elements (where C > N)?',
            options: ['O(1) extra space', 'O(C - N) unused allocated memory slots', 'O(N²)', 'Zero extra space'],
            correct: 1,
            explanation: 'The unused allocated capacity (C - N) remains reserved in memory until elements fill it or shrink-to-fit is called.',
            hint: 'Look at the pre-allocated empty slots waiting for future appends.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Advanced Application & Edge Cases (Q13 - Q14)
          {
            question: 'If a dynamic array shrinks capacity by half whenever N == Capacity / 2, what pathological problem occurs under alternating insertions and deletions?',
            options: ['Memory fragmentation deadlock', 'Thrashing: O(n) resize on every single alternating operation', 'Stack overflow', 'Pointer corruption'],
            correct: 1,
            explanation: 'Alternating insert and delete at the boundary triggers repeated 2x allocations and half-size deallocations in O(n) each step. Solved by shrinking only at Capacity / 4.',
            hint: 'Constantly crossing the 50% boundary back and forth forces continuous buffer reallocations.',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'How does multidimensional array indexing work in Row-Major order for array A[R][C] with base address B and element size S?',
            options: ['B + (row + col) * S', 'B + (row * C + col) * S', 'B + (col * R + row) * S', 'B + (row * col) * S'],
            correct: 1,
            explanation: 'In Row-Major order (C, C++, Python numpy), entire rows are stored sequentially: Address = B + (row * C + col) * S.',
            hint: 'Each row contains C elements that must be skipped before adding the column offset.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: High-Level Analysis & Rigorous Proofs (Q15 - Q16)
          {
            question: 'Using the Accounting Method for amortized analysis of dynamic array doubling, what is the minimum amortized charge per append to pay for all future copies?',
            options: ['1 dollar/credit', '2 dollars/credits', '3 dollars/credits', 'N dollars/credits'],
            correct: 2,
            explanation: 'Charge 3 credits: 1 credit pays for immediate insertion, 1 credit saves for this element moving later, and 1 credit saves for an older element moving later.',
            hint: 'CLRS aggregate dynamic table proof charges $3 per insertion.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'Which memory management constraint prevents a static array from extending into adjacent memory when its bound is reached?',
            options: ['Operating system file locks', 'Adjacent memory addresses may already be allocated to other variables or heap blocks', 'CPU register limits', 'Garbage collection cycle freezes'],
            correct: 1,
            explanation: 'Because memory beyond the array bound may belong to other variables or stack frames, growth must occur in a completely new contiguous block.',
            hint: 'Memory allocators protect adjacent allocated objects from being overwritten.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      },

      // ---------------------------------------------------------------------
      // Topic 1.2: Linked Lists & Doubly Linked Lists
      // ---------------------------------------------------------------------
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
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'What two components constitute a basic node in a Singly Linked List?',
            options: ['Key and Hash code', 'Data payload and Next pointer reference', 'Array index and Value', 'Left child and Right child'],
            correct: 1,
            explanation: 'A singly linked list node contains the stored data payload and a pointer/reference to the next node.',
            hint: 'A linear chain only needs data and a link to the next element.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'What is the value of the next pointer in the final node of a non-circular linked list?',
            options: ['0', 'Null / None', 'Pointer to head', '-1'],
            correct: 1,
            explanation: 'The terminal node in a standard linear linked list points to Null / None to signify the end of the sequence.',
            hint: 'The list terminates when no next element exists.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Identification & Basic Operations (Q3 - Q4)
          {
            question: 'What is the time complexity to insert a new node at the very beginning (head) of a linked list?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            correct: 0,
            explanation: 'Setting newNode.next = head and head = newNode takes O(1) constant time with zero element shifting.',
            hint: 'Only two pointer assignments are required at the head.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'Which type of linked list allows traversing both forward and backward through elements?',
            options: ['Singly linked list', 'Doubly linked list', 'Array list', 'Binary search tree'],
            correct: 1,
            explanation: 'Doubly linked lists contain both next and previous pointers, permitting two-way traversal.',
            hint: 'Look for the structure with dual directional links.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Concept Understanding & Tracing (Q5 - Q6)
          {
            question: 'What is the primary reason Binary Search cannot be performed in O(log n) on a singly linked list?',
            options: ['Linked lists cannot store sorted values', 'Finding the middle element requires O(n) linear steps because there is no direct indexing', 'Linked lists use too much CPU cache', 'Linked lists only store strings'],
            correct: 1,
            explanation: 'Without O(1) random access, locating the middle element in a linked list requires stepping through n/2 pointers in O(n) time.',
            hint: 'Binary search requires jumping to index n/2 in O(1) time.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'To delete a target node in a Singly Linked List, which reference is strictly required?',
            options: ['The target node only', 'The node immediately preceding the target node (previous node)', 'The tail node', 'The length of the list'],
            correct: 1,
            explanation: 'In a singly linked list, prev.next must be updated to target.next. Without the predecessor, the incoming pointer cannot be changed.',
            hint: 'You must redirect the link that currently points into the target node.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Pointer Manipulation (Q7 - Q8)
          {
            question: 'In a Doubly Linked List, how do you disconnect node X given pointers to X, X.prev, and X.next?',
            options: ['X.prev = X.next', 'X.prev.next = X.next; X.next.prev = X.prev;', 'X.next = null; X.prev = null;', 'head = X.next;'],
            correct: 1,
            explanation: 'Updating X.prev.next to bypass X and X.next.prev to bypass X completely removes X from the chain in O(1) time.',
            hint: 'Connect the predecessor directly to the successor in both directions.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'What algorithm detects a cycle (loop) in a linked list using O(1) auxiliary space?',
            options: ['Dijkstra algorithm', 'Floyd Cycle-Finding (Tortoise and Hare) algorithm', 'Binary Search', 'Kruskal algorithm'],
            correct: 1,
            explanation: 'Floyd cycle detection uses a slow pointer moving 1 step and a fast pointer moving 2 steps; they meet if and only if a cycle exists.',
            hint: 'Two pointers moving at different speeds inside a loop will eventually collide.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Problem Solving & Edge Cases (Q9 - Q10)
          {
            question: 'What is the purpose of using a Sentinel (Dummy) node at the head of a linked list during algorithm implementations?',
            options: ['To speed up CPU clock frequency', 'To eliminate special-case edge handling when inserting or deleting the head node', 'To reduce memory consumption to zero', 'To sort the list automatically'],
            correct: 1,
            explanation: 'A dummy head ensures that the target node always has a valid preceding node, removing boilerplate null checks for the head.',
            hint: 'Think about avoiding "if head is null or deleting head" edge cases.',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'Which data structure combination allows an LRU Cache to achieve O(1) get() and O(1) put() operations?',
            options: ['Array and Stack', 'Hash Map and Doubly Linked List', 'Binary Search Tree and Queue', 'Min-Heap and Matrix'],
            correct: 1,
            explanation: 'The Hash Map provides O(1) node lookup by key, and the Doubly Linked List provides O(1) node removal and moving to the head.',
            hint: 'One structure provides instant lookup; the other provides instant re-ordering of accessed nodes.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: Scenario Analysis (Q11 - Q12)
          {
            question: 'In a 64-bit operating system, what is the pointer memory overhead of a Doubly Linked List node storing a 4-byte integer?',
            options: ['4 bytes', '8 bytes', '16 bytes (8 bytes for next + 8 bytes for prev)', '64 bytes'],
            correct: 2,
            explanation: 'On 64-bit systems, each memory address pointer is 8 bytes. Two pointers (next and prev) equal 16 bytes of overhead for 4 bytes of payload.',
            hint: 'Calculate 2 pointer addresses * 8 bytes each.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'How do you reverse a Singly Linked List iteratively in O(n) time and O(1) space?',
            options: ['Swap values between first and last node', 'Maintain three pointers (prev, curr, next) and reverse pointers one by one', 'Create a new array and copy values', 'Use recursive tail recursion only'],
            correct: 1,
            explanation: 'Iteratively storing next = curr.next, setting curr.next = prev, and advancing prev and curr reverses the list in-place.',
            hint: 'Keep track of previous, current, and the saved next node.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Advanced Mechanics & Applications (Q13 - Q14)
          {
            question: 'In a circular singly linked list with only a tail pointer, what is the time complexity to insert at both the head and the tail?',
            options: ['O(n) for both', 'O(1) for both', 'O(1) for head, O(n) for tail', 'O(n) for head, O(1) for tail'],
            correct: 1,
            explanation: 'Because tail.next is the head, inserting at head is tail.next = newNode in O(1), and inserting at tail is the same followed by tail = newNode in O(1).',
            hint: 'A tail pointer gives immediate access to both the tail and the head (via tail.next).',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'What is an Unrolled Linked List and what major problem does it solve?',
            options: ['A list that cannot be reversed', 'A linked list where each node holds a small array of elements to dramatically improve CPU cache locality', 'A list with no pointer fields', 'A circular stack'],
            correct: 1,
            explanation: 'Unrolled linked lists store multiple elements in each node array, reducing pointer memory overhead and boosting cache line utilization.',
            hint: 'Combines the flexibility of linked nodes with the cache benefits of small arrays.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: High-Level Analysis & Complex Systems (Q15 - Q16)
          {
            question: 'What is the time complexity of finding the k-th node from the end of a singly linked list in a single pass?',
            options: ['O(n²) time and O(n) space', 'O(n) time and O(1) auxiliary space using two pointers separated by k steps', 'O(log n) time', 'O(k) time without reading the list'],
            correct: 1,
            explanation: 'Advancing a first pointer k steps ahead, then moving both pointers at equal speed until the first reaches the end finds the k-th last node in one pass.',
            hint: 'Maintain a fixed gap of k steps between leader and follower pointers.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'Why does memory fragmentation occur more frequently when using high-churn linked lists compared to dynamic arrays in C/C++?',
            options: ['Arrays do not use virtual memory', 'Frequent allocation and deallocation of small individual node chunks scatters heap pages', 'Linked lists lock memory pages', 'Linked lists bypass kernel malloc'],
            correct: 1,
            explanation: 'Allocating millions of individual small node structs across heap addresses leads to external memory fragmentation and cache thrashing.',
            hint: 'Small, non-contiguous allocations leave scattered unusable gaps across heap pages.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      },

      // ---------------------------------------------------------------------
      // Topic 1.3: Stacks & Queues (LIFO & FIFO)
      // ---------------------------------------------------------------------
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

3. Deque (Double-Ended Queue):
Allows O(1) push and pop operations at both the front and rear ends.

4. Priority Queues & Binary Heaps:
A Priority Queue serves elements based on highest (or lowest) priority value rather than arrival time. Standard implementations use a Binary Heap (complete binary tree stored in an array):
- peek(): O(1) root access
- push(x) / insert: O(log n) sift-up
- pop() / extract-min: O(log n) sift-down

5. Complexity Comparison:
- Stack push/pop: O(1) time, O(n) space
- Queue enqueue/dequeue: O(1) time, O(n) space
- Priority Queue insert/extract: O(log n) time, O(n) space

6. Common Mistakes:
- Stack overflow from unbounded recursion without a base case.
- Forgetting to handle circular queue full/empty condition (front == (rear + 1) % size).
- Using an array for a queue without circular indexing, leading to O(n) dequeue shifts.

7. Quick Revision Summary:
Stacks power recursion and backtracking via LIFO. Queues manage ordered buffering and BFS via FIFO. Priority Queues use binary heaps for O(log n) priority-based extraction.

8. Verified Educational References:
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
          { front: 'Which data structure evaluates arithmetic postfix (Reverse Polish) expressions?', back: 'A Stack, pushing operands and popping two operands upon encountering an operator.', hint: 'Think of LIFO operand reduction.' },
          { front: 'What is the mathematical condition for a circular array queue of capacity N to be full?', back: '(rear + 1) % N == front', hint: 'The next rear slot collides with the front.' }
        ],
        quizzes: [
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'Which principle governs the insertion and extraction order in a standard Stack?',
            options: ['First In, First Out (FIFO)', 'Last In, First Out (LIFO)', 'Shortest Job First', 'Random Access'],
            correct: 1,
            explanation: 'Stacks enforce Last In, First Out (LIFO), meaning the most recently pushed item is the first one popped.',
            hint: 'Think of a stack of cafeteria trays.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'Which principle governs the order of operations in a standard Queue?',
            options: ['Last In, First Out (LIFO)', 'First In, First Out (FIFO)', 'Priority In, Priority Out', 'Highest Memory First'],
            correct: 1,
            explanation: 'Queues enforce First In, First Out (FIFO), processing elements in the exact order of their arrival.',
            hint: 'Think of a checkout line at a store.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Identification & Basic Operations (Q3 - Q4)
          {
            question: 'What is the time complexity of push and pop operations on an array-backed stack with top index tracking?',
            options: ['O(1) constant time', 'O(n) linear time', 'O(log n)', 'O(n²)'],
            correct: 0,
            explanation: 'Push and pop only increment or decrement the top index pointer and read/write that single slot in O(1) time.',
            hint: 'Only the top element is accessed; no other elements move.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'Which traversal algorithm for graphs and trees fundamentally uses a Queue?',
            options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'In-Order Traversal', 'Topological Sort with DFS'],
            correct: 1,
            explanation: 'BFS explores vertices level by level, placing newly discovered neighbors at the rear of a FIFO Queue.',
            hint: 'Level-by-level exploration requires FIFO processing.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Concept Understanding & Tracing (Q5 - Q6)
          {
            question: 'When evaluating the postfix expression "5 3 + 2 *", what is the final result computed using a Stack?',
            options: ['11', '16', '13', '21'],
            correct: 1,
            explanation: 'Push 5, push 3. Encounter "+": pop 3 and 5, push 5+3=8. Push 2. Encounter "*": pop 2 and 8, push 8*2=16.',
            hint: 'Perform (5 + 3) first, then multiply the sum by 2.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'Why does a naive array implementation of a queue suffer from O(n) dequeue time if elements are not shifted?',
            options: ['Because arrays cannot store pointers', 'Removing the front element at index 0 leaves an empty slot unless all elements shift left', 'Memory is corrupted', 'Stack overflow occurs'],
            correct: 1,
            explanation: 'If the front is fixed at index 0, removing an element requires shifting all remaining n elements left, taking O(n) time.',
            hint: 'Shifting remaining elements takes linear time.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Circular Queue & Heaps (Q7 - Q8)
          {
            question: 'How does a Circular Queue eliminate the O(n) shifting penalty in array-based queues?',
            options: ['By allocating a new array on every push', 'By using modulo arithmetic to wrap front and rear indices around the array boundaries', 'By converting the array to a binary search tree', 'By deleting half the elements'],
            correct: 1,
            explanation: 'Modulo indexing (index = (index + 1) % Capacity) allows front and rear to advance continuously in O(1) without shifting.',
            hint: 'Wrap the pointer around to index 0 when it hits the array boundary.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'What is the time complexity to insert an element into a Binary Heap-based Priority Queue of size n?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correct: 1,
            explanation: 'Inserting into a binary heap places the element at the next leaf and sifts up along the tree height of log2(n).',
            hint: 'The height of a complete binary tree is logarithmic.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Problem Solving & Applications (Q9 - Q10)
          {
            question: 'How can a Queue be implemented using two Stacks (Inbox and Outbox)?',
            options: ['Push to Inbox; on dequeue, if Outbox is empty, pop all from Inbox to Outbox and pop from Outbox', 'Alternate pushing between the two stacks', 'Store elements in both stacks simultaneously', 'Sort both stacks after every operation'],
            correct: 0,
            explanation: 'Pouring elements from Inbox to Outbox reverses their order twice, turning LIFO into FIFO with amortized O(1) cost per operation.',
            hint: 'Two reversals restore original FIFO arrival order.',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'Which of the following problems is solved efficiently using a Monotonic Stack in O(n) total time?',
            options: ['Shortest Path in Weighted Graph', 'Next Greater Element for every item in an array', 'Matrix Multiplication', 'K-Means Clustering'],
            correct: 1,
            explanation: 'A monotonic stack maintains elements in sorted order, resolving the Next Greater Element problem in a single O(n) pass.',
            hint: 'Elements are pushed and popped at most once while tracking nearest greater values.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: Scenario & Systems Analysis (Q11 - Q12)
          {
            question: 'What occurs when a recursive function calls itself indefinitely without reaching a terminating base case?',
            options: ['Heap fragmentation', 'Call Stack Overflow (exceeding memory allocated for execution stack frames)', 'Queue starvation', 'Deadlock'],
            correct: 1,
            explanation: 'Each function invocation pushes a new stack frame containing registers and local variables; infinite recursion exhausts call stack memory.',
            hint: 'The runtime call stack runs out of memory frames.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'In an Operating System print spooler where documents must print in the exact order received, which data structure is most appropriate?',
            options: ['Stack', 'FIFO Queue', 'Min-Heap', 'Hash Table'],
            correct: 1,
            explanation: 'A FIFO queue ensures that the first print job submitted is the first print job processed by the physical printer.',
            hint: 'Fair scheduling in order of submission requires First-In-First-Out.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Advanced Structures & Deques (Q13 - Q14)
          {
            question: 'In the Sliding Window Maximum problem of array size N with window size K, what data structure yields O(N) overall time complexity?',
            options: ['Max-Heap (yielding O(N log K))', 'Monotonic Double-Ended Queue (Deque) storing indices of potential maximums', 'Nested loops (yielding O(N*K))', 'Binary Search Tree'],
            correct: 1,
            explanation: 'A monotonic deque maintains indices of decreasing elements, inserting and removing each index at most once for O(N) total runtime.',
            hint: 'Each index enters and leaves the double-ended queue at most once.',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'In a complete Binary Min-Heap stored in an array at index i (1-indexed), what are the array indices of the parent, left child, and right child?',
            options: ['Parent: i-1, Left: i+1, Right: i+2', 'Parent: floor(i/2), Left: 2*i, Right: 2*i + 1', 'Parent: 2*i, Left: i/2, Right: i/2 + 1', 'Parent: i, Left: i*i, Right: i*i + 1'],
            correct: 1,
            explanation: 'For a 1-indexed heap array: parent is at floor(i/2), left child is at 2*i, and right child is at 2*i + 1.',
            hint: 'Children double the parent index; parent halves the child index.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: High-Level Analysis & Complex Systems (Q15 - Q16)
          {
            question: 'Why is building a binary heap of N elements using Bottom-Up Floyd Heapify O(N) instead of O(N log N)?',
            options: ['Because it uses multithreading', 'Because the majority of nodes are near the leaves where required sift-down height is small (sum of h/2^h converges to 2)', 'Because comparisons are skipped', 'Because memory is contiguous'],
            correct: 1,
            explanation: 'Half the nodes are leaves (height 0), a quarter have height 1, an eighth have height 2. The geometric series sum(h / 2^h) converges to 2, proving O(N) linear time.',
            hint: 'Most nodes have very short paths to the bottom of the tree.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'In lock-free concurrent programming, how is the ABA Problem mitigated when implementing lock-free stacks using Compare-And-Swap (CAS)?',
            options: ['By disabling CPU interrupts', 'By attaching a version/generation counter tag to the top pointer (Tagged Pointers)', 'By using recursive mutexes', 'By clearing the stack after each pop'],
            correct: 1,
            explanation: 'Tagged pointers pair the address with a monotonic modification counter, ensuring CAS fails if a node was popped, reused, and pushed back.',
            hint: 'Add a version number to the pointer so reused addresses are detected.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      },

      // ---------------------------------------------------------------------
      // Topic 1.4: Binary Search Trees & Balanced AVL Trees
      // ---------------------------------------------------------------------
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
Invented by Adelson-Velsky and Landis (1962), an AVL tree maintains the strict balance invariant that for every node:
- Balance Factor = Height(Left Subtree) - Height(Right Subtree) must be in {-1, 0, +1}.
- If |Balance Factor| >= 2, the tree performs rotations in O(1) time to restore balance.

4. AVL Rotations:
- Left-Left (LL) Heavy: Fixed by a Single Right Rotation.
- Right-Right (RR) Heavy: Fixed by a Single Left Rotation.
- Left-Right (LR) Heavy: Fixed by a Left Rotation on Left Child, then Right Rotation on Node.
- Right-Left (RL) Heavy: Fixed by a Right Rotation on Right Child, then Left Rotation on Node.

5. Complexity Comparison:
- AVL Height Bound: Strictly <= 1.44 * log2(n)
- Search: O(log n) guaranteed
- Insertion: O(log n) with at most 2 rotations
- Deletion: O(log n) with up to O(log n) rotations up the root path

6. Real-World Applications:
- In-memory ordered dictionaries and sets (std::map, TreeSet)
- Database indexing and range query execution
- Computational geometry (sweep-line algorithms)

7. Common Mistakes & Exam Tips:
- Confusing BST with Binary Heap: BST maintains horizontal left-right order; Heap maintains vertical parent-child priority.
- Forgetting that deleting a node with two children requires replacing it with its In-Order Successor (smallest in right subtree) or In-Order Predecessor.

8. Verified Educational References:
- CLRS, "Introduction to Algorithms", 4th Edition, Chapter 12 (Binary Search Trees) and Chapter 13 (Red-Black Trees).
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
          { front: 'What tree traversal on a BST yields keys in strictly ascending sorted order?', back: 'In-Order Traversal (Left, Root, Right).', hint: 'Traverse left subtree, visit node, traverse right subtree.' },
          { front: 'What rotation sequence fixes a Left-Right (LR) imbalance in an AVL tree?', back: 'Left rotation on the left child, followed by a Right rotation on the unbalanced root node.', hint: 'Double rotation: first left, then right.' }
        ],
        quizzes: [
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'Which fundamental property defines a Binary Search Tree (BST)?',
            options: ['All nodes must have exactly two children', 'Left subtree keys < Node key < Right subtree keys', 'Parent key is always greater than both children', 'All leaf nodes are at the same depth'],
            correct: 1,
            explanation: 'In a BST, every node in the left subtree has a key smaller than the root, and every node in the right subtree has a key larger than the root.',
            hint: 'Smaller keys go left; larger keys go right.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'Which tree traversal algorithm produces all BST keys in strictly sorted ascending order?',
            options: ['Pre-Order Traversal', 'In-Order Traversal', 'Post-Order Traversal', 'Level-Order Traversal'],
            correct: 1,
            explanation: 'In-Order traversal recursively visits Left subtree, then current Node, then Right subtree, producing keys in sorted order.',
            hint: 'Visit in the middle of left and right.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Basic Operations (Q3 - Q4)
          {
            question: 'What is the worst-case time complexity of searching in a completely unbalanced (skewed) BST of n elements?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correct: 2,
            explanation: 'Inserting sorted keys into an unbalancing BST creates a linear linked-list chain of height n, resulting in O(n) search time.',
            hint: 'A single straight chain has height proportional to n.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'What is the valid range of the Balance Factor (Height_Left - Height_Right) for every node in an AVL tree?',
            options: ['Exactly 0', '{-1, 0, +1}', '{-2, -1, 0, 1, 2}', 'Any positive integer'],
            correct: 1,
            explanation: 'An AVL tree strictly requires that the height difference between left and right subtrees of every node is at most 1 (i.e. -1, 0, or +1).',
            hint: 'Height difference must not exceed 1 in magnitude.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Concept Understanding & Tracing (Q5 - Q6)
          {
            question: 'When deleting a node that has TWO children in a BST, which node can replace it to preserve BST properties?',
            options: ['Any random leaf node', 'The In-Order Successor (smallest node in right subtree) or In-Order Predecessor', 'The tree root node', 'The left child node unconditionally'],
            correct: 1,
            explanation: 'The In-Order Successor is greater than all left subtree nodes and smaller than all remaining right subtree nodes, maintaining valid ordering.',
            hint: 'Look for the next smallest value in the right subtree.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'Which rotation is required to rebalance an AVL node with a Balance Factor of +2 whose left child has a Balance Factor of +1 (Left-Left case)?',
            options: ['Single Left Rotation', 'Single Right Rotation', 'Left-Right Double Rotation', 'Right-Left Double Rotation'],
            correct: 1,
            explanation: 'A Left-Left heavy imbalance is resolved with a single Right Rotation around the unbalanced node.',
            hint: 'Rotate to the right to pull down the heavy left side.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Rotations & Balances (Q7 - Q8)
          {
            question: 'Which sequence of rotations fixes a Left-Right (LR) imbalance where a node has balance +2 and its left child has balance -1?',
            options: ['Right rotation on root only', 'Left rotation on left child, followed by Right rotation on root', 'Right rotation on left child, followed by Left rotation on root', 'Two consecutive Left rotations on root'],
            correct: 1,
            explanation: 'An LR imbalance is first converted to an LL case via a Left Rotation on the left child, then rebalanced via a Right Rotation on the root.',
            hint: 'Rotate the child left first, then rotate the parent right.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'What is the maximum height of an AVL tree containing n nodes?',
            options: ['O(1)', 'O(log2 n) (strictly bounded by ~1.44 * log2 n)', 'O(n)', 'O(n²)'],
            correct: 1,
            explanation: 'The strict AVL balance factor constraint guarantees that height never exceeds 1.44 * log2(n), ensuring O(log n) operations.',
            hint: 'The height is strictly logarithmic in the number of nodes.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Problem Solving & Edge Cases (Q9 - Q10)
          {
            question: 'If you insert keys [10, 20, 30] sequentially into an initially empty AVL tree, what is the root node after rebalancing?',
            options: ['10', '20', '30', 'Null'],
            correct: 1,
            explanation: 'Inserting 10, then 20, then 30 causes an RR imbalance at node 10. A single Left Rotation makes 20 the new root with children 10 and 30.',
            hint: '20 is the median value that becomes the pivot root.',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'What is the time complexity of finding the Minimum element in a valid Binary Search Tree of height h?',
            options: ['O(1)', 'O(h)', 'O(n log n)', 'O(h²)'],
            correct: 1,
            explanation: 'The minimum element is found by traversing left child pointers until reaching a node with no left child, taking O(h) steps.',
            hint: 'Follow the leftmost path from the root.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: Comparative Analysis (Q11 - Q12)
          {
            question: 'How do AVL trees compare with Red-Black trees in terms of search vs insertion performance trade-offs?',
            options: ['AVL trees are faster for searching due to stricter balance; Red-Black trees are faster for frequent insertions/deletions with fewer rotations', 'Red-Black trees have strictly smaller height than AVL trees', 'AVL trees do not support deletions', 'They are mathematically identical'],
            correct: 0,
            explanation: 'AVL trees are more rigidly balanced, giving faster lookups. Red-Black trees allow slightly more height slack, reducing rotation overhead on writes.',
            hint: 'Stricter balance equals faster searches but more rebalancing rotations.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'What is the Lowest Common Ancestor (LCA) of nodes with keys 3 and 8 in a BST with root key 6?',
            options: ['3', '6', '8', '14'],
            correct: 1,
            explanation: 'Since 3 < 6 and 8 > 6, the two nodes diverge at root 6. Therefore, node 6 is their Lowest Common Ancestor.',
            hint: 'The split point where one key is to the left and one is to the right is the LCA.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Advanced Applications & Algorithms (Q13 - Q14)
          {
            question: 'What is the worst-case number of rotations required during a single node DELETION in an AVL tree?',
            options: ['At most 1 rotation', 'At most 2 rotations', 'O(log n) rotations (rebalancing can propagate up the entire root path)', 'O(n) rotations'],
            correct: 2,
            explanation: 'Unlike insertion (which terminates after at most 2 rotations), deletion can change subtree height and trigger rotations at every ancestor up to root.',
            hint: 'Height reduction can cascade all the way up to the root.',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'How can an Augmented BST find the k-th smallest element in O(log n) time?',
            options: ['By running an in-order scan', 'By storing the size (count of nodes) of the left subtree inside each node', 'By hashing all keys', 'By sorting pointers in an array'],
            correct: 1,
            explanation: 'Storing subtree size allows decision-making: if left_size == k - 1, current is k-th; if left_size >= k, go left; else go right for (k - left_size - 1).',
            hint: 'Each node tracks how many elements exist in its subtrees.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: High-Level Analysis & Complex Systems (Q15 - Q16)
          {
            question: 'Why are B-Trees or B+ Trees preferred over AVL Trees for database indexes on disk storage?',
            options: ['AVL trees cannot store integers', 'B-Trees have high fan-out (hundreds of keys per node), minimizing expensive disk block I/O seeks', 'AVL trees require too much RAM bandwidth', 'Disk hardware only understands B-Trees'],
            correct: 1,
            explanation: 'AVL trees are binary (fan-out 2), causing deep trees with many disk seeks. B-Trees match disk block sizes with high branching factor to keep height tiny (3-4 levels).',
            hint: 'High branching factor reduces tree height to 3 or 4 disk seeks.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'What is the recurrence relation for the minimum number of nodes N(h) in an AVL tree of height h?',
            options: ['N(h) = 2 * N(h - 1)', 'N(h) = N(h - 1) + N(h - 2) + 1 (Fibonacci-like recurrence)', 'N(h) = N(h / 2) + 1', 'N(h) = h²'],
            correct: 1,
            explanation: 'To minimize nodes at height h, one subtree has height h-1 and the other has height h-2: N(h) = N(h - 1) + N(h - 2) + 1, proving height is bounded by Fibonacci numbers.',
            hint: 'One child has height h-1, the other has height h-2, plus the root node.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      },

      // ---------------------------------------------------------------------
      // Topic 1.5: Graphs, BFS/DFS & Dijkstra Algorithm
      // ---------------------------------------------------------------------
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
  • With Array: O(V²)

5. Critical Constraint:
Dijkstra FAILs on graphs with negative edge weights because its greedy assumption that a visited node's distance is permanently optimal is violated. For negative edge weights, use the Bellman-Ford algorithm (O(V * E)) or Floyd-Warshall (O(V³)).

6. Real-World Applications:
- GPS navigation and mapping engines (Google Maps, OSRM)
- Network routing protocols (OSPF - Open Shortest Path First, IS-IS)
- Social network connection hops and dependency resolution

7. Quick Revision Summary:
BFS finds shortest paths in unweighted graphs in O(V + E). Dijkstra finds shortest paths in non-negative weighted graphs in O((V + E) log V) using a min-heap.

8. Verified Educational References:
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
          { front: 'Why does Dijkstra algorithm fail on graphs with negative edge weights?', back: 'Because once a node is marked visited with minimum tentative distance, Dijkstra assumes no shorter path exists. A negative edge later violates this greedy assumption.', hint: 'Greedy finality assumption is broken by negative edge costs.' },
          { front: 'What is the time complexity of Dijkstra implemented with a binary min-heap?', back: 'O((V + E) log V) time.', hint: 'Each vertex is extracted once (V log V) and each edge relaxed once (E log V).' }
        ],
        quizzes: [
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'What is the space complexity of representing a graph with V vertices and E edges using an Adjacency List?',
            options: ['O(V²)', 'O(V + E)', 'O(E²)', 'O(1)'],
            correct: 1,
            explanation: 'An adjacency list stores an array of V lists containing a total of E directed edge records, using O(V + E) space.',
            hint: 'Sum of vertices plus total number of edges stored.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'Which graph traversal algorithm finds the shortest path in an UNWEIGHTED graph?',
            options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Kruskal Algorithm', 'Prim Algorithm'],
            correct: 1,
            explanation: 'BFS explores vertices level by level, ensuring that the first time a node is reached corresponds to the minimum number of edge hops.',
            hint: 'Level-by-level exploration yields minimum step count.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Basic Operations & Conditions (Q3 - Q4)
          {
            question: 'What is the mandatory prerequisite constraint on edge weights for Dijkstra algorithm to guarantee correctness?',
            options: ['All edge weights must be negative', 'All edge weights must be strictly integers', 'All edge weights must be non-negative (weight >= 0)', 'The graph must have no cycles'],
            correct: 2,
            explanation: 'Dijkstra relies on greedy monotonic distance expansion; negative edge weights invalidate permanent node distance finalization.',
            hint: 'Edges cannot have negative costs.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'What data structure is used to optimize the extract-minimum step in Dijkstra algorithm?',
            options: ['Stack', 'Min-Priority Queue (Binary Min-Heap)', 'Hash Table', 'Circular Array'],
            correct: 1,
            explanation: 'A Min-Priority Queue enables extracting the vertex with the smallest tentative distance in O(log V) time.',
            hint: 'Extracts the lowest distance vertex in logarithmic time.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Concept Understanding & Tracing (Q5 - Q6)
          {
            question: 'What does the Edge Relaxation step in shortest path algorithms compute for edge (u, v) with weight w?',
            options: ['dist[u] = dist[v] + w', 'if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; }', 'dist[v] = min(u, v)', 'dist[u] = 0'],
            correct: 1,
            explanation: 'Relaxation checks if traveling through u offers a shorter path to v than the currently recorded distance dist[v].',
            hint: 'Check if path through u improves current distance to v.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'Which algorithm finds single-source shortest paths in graphs that MAY contain negative edge weights (and detects negative cycles)?',
            options: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Breadth-First Search', 'Prim Algorithm'],
            correct: 1,
            explanation: 'Bellman-Ford relaxes all E edges V-1 times, correctly finding shortest paths with negative edges and detecting negative cycles in O(V * E) time.',
            hint: 'Relaxes all edges V-1 times.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Complexities & Mechanics (Q7 - Q8)
          {
            question: 'What is the overall time complexity of Dijkstra algorithm on a graph with V vertices and E edges using a Binary Min-Heap?',
            options: ['O(V²)', 'O((V + E) log V)', 'O(V * E)', 'O(V³ log V)'],
            correct: 1,
            explanation: 'Extracting min V times takes O(V log V), and relaxing E edges with decrease-key takes O(E log V), giving O((V + E) log V) total time.',
            hint: 'Sum of V extract-min operations and E priority queue updates.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'In a Directed Acyclic Graph (DAG), in what order must tasks be executed so that every prerequisite task finishes before dependent tasks?',
            options: ['Post-order sequence', 'Topological Sort order', 'Level-order sequence', 'Eulerian Path order'],
            correct: 1,
            explanation: 'Topological sorting linearly orders DAG vertices such that for every directed edge u -> v, u appears before v.',
            hint: 'Linear ordering preserving all directed dependency arrows.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Problem Solving & Applications (Q9 - Q10)
          {
            question: 'How can you detect if an undirected graph contains a cycle during Depth-First Search (DFS)?',
            options: ['If a vertex has no neighbors', 'If DFS encounters an already-visited vertex that is NOT the immediate parent of the current vertex', 'If the graph has an odd number of vertices', 'If all edges have equal weights'],
            correct: 1,
            explanation: 'Encountering a visited back-edge to an ancestor other than the immediate parent confirms a closed loop/cycle in the undirected graph.',
            hint: 'Finding a visited neighbor that is not the parent indicates a cycle.',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'What is the maximum number of edges in a simple connected undirected graph with V vertices?',
            options: ['V', 'V - 1', 'V * (V - 1) / 2', 'V²'],
            correct: 2,
            explanation: 'Every vertex can connect to V-1 other vertices. Dividing by 2 for undirected edges gives V * (V - 1) / 2.',
            hint: 'Combination formula V choose 2.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: Scenario Analysis & Comparisons (Q11 - Q12)
          {
            question: 'Why is an Adjacency Matrix preferred over an Adjacency List for Dense Graphs where E is close to V²?',
            options: ['Adjacency matrix uses less memory for sparse graphs', 'Adjacency matrix provides O(1) direct edge lookup without pointer chasing overhead, and space is already O(V²)', 'Adjacency list cannot store directed edges', 'Adjacency matrix automatically balances trees'],
            correct: 1,
            explanation: 'When E ~ V², an adjacency list uses more memory (due to node pointers) than a compact 2D boolean/weight matrix, and matrix edge lookup is instant.',
            hint: 'In dense graphs with almost all edges present, direct matrix indexing is faster and pointer-free.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'Which routing protocol in computer networking uses Dijkstra algorithm on link-state databases to compute shortest forwarding routes?',
            options: ['BGP (Border Gateway Protocol)', 'OSPF (Open Shortest Path First)', 'RIP (Routing Information Protocol)', 'DNS'],
            correct: 1,
            explanation: 'OSPF routers flood link-state packets and run Dijkstra SPF algorithm locally to compute the shortest routing table paths.',
            hint: 'Standard interior link-state routing protocol.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Advanced Algorithms (Q13 - Q14)
          {
            question: 'What is the time complexity of the Floyd-Warshall algorithm for finding All-Pairs Shortest Paths in a graph with V vertices?',
            options: ['O(V log V)', 'O(V * E)', 'O(V³)', 'O(2^V)'],
            correct: 2,
            explanation: 'Floyd-Warshall uses dynamic programming with three nested loops from 1 to V, resulting in O(V³) time complexity.',
            hint: 'Three nested loops iterating over intermediate vertices k, i, and j.',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'What is the theoretical time complexity of Dijkstra algorithm when implemented with a Fibonacci Heap?',
            options: ['O(V²)', 'O(E + V log V)', 'O(E log E)', 'O(V³)'],
            correct: 1,
            explanation: 'Fibonacci heaps optimize the decrease-key operation to amortized O(1) time, reducing the total runtime from O((V+E) log V) to O(E + V log V).',
            hint: 'Amortized O(1) decrease-key lowers the edge factor from E log V to E.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: High-Level Analysis & Complex Systems (Q15 - Q16)
          {
            question: 'How does A* (A-Star) search improve upon Dijkstra algorithm in spatial navigation problems?',
            options: ['By ignoring all edge weights', 'By adding an admissible heuristic h(n) estimation of distance to the goal to guide search directionally', 'By running backwards only', 'By converting the graph into a spanning tree'],
            correct: 1,
            explanation: 'A* evaluates f(n) = g(n) + h(n), where g(n) is exact cost from start and h(n) is heuristic distance to goal, pruning unnecessary state exploration.',
            hint: 'Combines actual path cost with heuristic remaining distance estimate.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'In Tarjan algorithm for Strongly Connected Components (SCCs), what do the discovery time and low-link values identify?',
            options: ['Shortest paths in undirected graphs', 'The root of an SCC reachable via tree edges and back edges without leaving the component', 'Maximum bipartite matching', 'Minimum spanning tree weight'],
            correct: 1,
            explanation: 'A vertex is the root of an SCC if and only if its low-link value equals its discovery time, popping all component nodes from the stack in O(V + E).',
            hint: 'Identifies the highest ancestor reachable from a subtree.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // SUBJECT 2: OPERATING SYSTEMS
  // =========================================================================
  {
    name: 'Operating Systems',
    code: 'operating_systems',
    color: '#10B981',
    icon: '💻',
    description: 'Processes, Threads, CPU Scheduling, Memory Management, Virtual Memory, and File Systems',
    topics: [
      // ---------------------------------------------------------------------
      // Topic 2.1: Process Management & Process Control Block (PCB)
      // ---------------------------------------------------------------------
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
The PCB (also called Task Control Block) is the kernel data structure maintaining all metadata for a process:
- Process ID (PID)
- Process State (Ready, Running, Waiting, etc.)
- Program Counter (PC) address of next instruction
- CPU Registers (Accumulators, Index registers, Stack Pointer)
- CPU Scheduling Information (Priority, queue pointers)
- Memory Management Information (Page tables, base/limit registers)
- Accounting Information (CPU time used, clock limits)
- I/O Status Information (List of open file descriptors, allocated devices)

5. Context Switching:
Context switching is the mechanism of saving the state of the currently running process into its PCB and restoring the state of another ready process from its PCB.
- Overhead: Pure computational overhead because the CPU performs no useful user work during switching. Hardware TLB caches must be flushed or re-indexed.

6. Process vs Thread:
- Process: Isolated address space; IPC (pipes, sockets, shared memory) required for communication. Heavyweight context switch.
- Thread: Lightweight unit of execution sharing code, data, and heap within a parent process, but maintaining its own private stack and registers.

7. Real-World Applications:
- Process isolation in modern web browsers (Chrome multi-process tabs)
- Daemon and background service management in Linux (systemd)
- Microservices and containerization (Docker process namespaces)

8. Verified Educational References:
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
          { front: 'What critical information is saved into the PCB during a context switch?', back: 'Program Counter, CPU general-purpose registers, stack pointer, and process execution state.', hint: 'Everything needed to resume execution seamlessly later.' },
          { front: 'What is the fundamental difference between a Process and a Thread?', back: 'Processes have independent, isolated address spaces; threads share the parent process memory space (heap/data/code).', hint: 'Think about memory isolation vs shared heap.' }
        ],
        quizzes: [
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'What is the primary difference between a Program and a Process?',
            options: ['A program is written in Python; a process is written in C', 'A program is a passive executable file on disk; a process is an active program in execution', 'A program runs in kernel mode; a process runs in user mode', 'There is no difference'],
            correct: 1,
            explanation: 'A program is passive code stored on storage media; a process is the dynamic instance loaded into RAM executing on the CPU.',
            hint: 'One is static on disk; the other is running in memory.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'Which kernel data structure stores all metadata, register states, and accounting information for an active process?',
            options: ['File Allocation Table (FAT)', 'Process Control Block (PCB)', 'Translation Lookaside Buffer (TLB)', 'Interrupt Vector Table'],
            correct: 1,
            explanation: 'The Process Control Block (PCB) tracks PID, program counter, register states, memory limits, and open files for each process.',
            hint: 'The central block controlling process metadata.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Identification & States (Q3 - Q4)
          {
            question: 'When a process requests disk I/O and must wait for data transfer, which state does it transition into?',
            options: ['Ready', 'Running', 'Waiting / Blocked', 'Terminated'],
            correct: 2,
            explanation: 'Processes awaiting external events or I/O operations move from Running to the Waiting (Blocked) state.',
            hint: 'The process cannot run until the I/O event completes.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'In the memory layout of a C program, which segment stores dynamically allocated memory created via malloc() or new?',
            options: ['Text Segment', 'Stack Segment', 'Heap Segment', 'BSS Data Segment'],
            correct: 2,
            explanation: 'The Heap segment manages dynamic runtime memory allocation and grows upward toward higher memory addresses.',
            hint: 'Dynamically allocated heap memory.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Concept Understanding & Tracing (Q5 - Q6)
          {
            question: 'What is a Context Switch in an Operating System?',
            options: ['Changing the language compiler', 'Saving the execution state of the current process and restoring the saved state of another process', 'Switching the monitor resolution', 'Upgrading the operating system kernel'],
            correct: 1,
            explanation: 'Context switching preserves the running process registers and PC into its PCB, loading the next ready process state to share the CPU.',
            hint: 'Switching CPU execution between different tasks.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'Why is context switching considered pure system overhead?',
            options: ['It consumes hard drive storage permanently', 'The CPU performs no useful user work while saving and loading register states', 'It causes physical hardware wear', 'It destroys open network connections'],
            correct: 1,
            explanation: 'During context switching, CPU cycles are spent executing kernel management code rather than user application instructions.',
            hint: 'No user application code runs during the switch.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Threads vs Processes (Q7 - Q8)
          {
            question: 'Which of the following resources is shared between multiple peer threads within the SAME process?',
            options: ['CPU Registers', 'Private Stack memory', 'Heap memory and global variables', 'Program Counter'],
            correct: 2,
            explanation: 'Threads within the same process share the text, data, and heap segments, but each thread maintains its own private stack and registers.',
            hint: 'Threads share general memory but need private execution stacks.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'In Unix/Linux systems, what system call creates a new child process as an exact duplicate of the calling parent process?',
            options: ['exec()', 'fork()', 'pthread_create()', 'wait()'],
            correct: 1,
            explanation: 'fork() duplicates the calling process, returning 0 to the child process and the child PID to the parent process.',
            hint: 'The standard Unix system call for process creation.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Problem Solving & Synchronization (Q9 - Q10)
          {
            question: 'What optimization allows modern operating systems to execute fork() almost instantaneously without copying all physical memory pages?',
            options: ['Direct Memory Access (DMA)', 'Copy-On-Write (COW)', 'Virtual Cache Bypassing', 'Demand Paging Thrashing'],
            correct: 1,
            explanation: 'Copy-On-Write shares physical pages read-only between parent and child; pages are duplicated only if one process modifies them.',
            hint: 'Pages are duplicated only when a write attempt occurs.',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'What is a Zombie Process in Unix/Linux operating systems?',
            options: ['A process that runs forever in an infinite loop', 'A terminated process whose parent has not yet read its exit status via wait()', 'A process that consumes 100% CPU', 'A process with no PID'],
            correct: 1,
            explanation: 'A zombie process has finished execution but retains an entry in the process table so its parent can read its exit code.',
            hint: 'Finished execution but still lingering in the process table.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: IPC & System Calls (Q11 - Q12)
          {
            question: 'Which Inter-Process Communication (IPC) mechanism provides the highest data transfer speed between two local processes?',
            options: ['Pipes', 'Shared Memory', 'Message Queues', 'TCP Sockets'],
            correct: 1,
            explanation: 'Shared memory maps the same physical RAM pages into both processes address spaces, allowing direct memory access without kernel copying.',
            hint: 'Zero kernel buffer copying overhead.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'What happens to a child process if its parent process terminates without calling wait() (Orphan Process)?',
            options: ['The child process is immediately aborted', 'The child process is adopted by the system initialization process (init or systemd PID 1)', 'The child process runs in kernel mode forever', 'The computer reboots'],
            correct: 1,
            explanation: 'Orphaned processes are adopted by the root init process (PID 1), which periodically invokes wait() to clean up terminated child zombies.',
            hint: 'PID 1 adopts all orphaned children.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Advanced Architectures (Q13 - Q14)
          {
            question: 'In User-Level Threads (Many-to-One model), what happens to the entire process if a single thread executes a blocking system call?',
            options: ['Only that single thread blocks while others continue', 'The entire process blocks because the kernel is unaware of user-level threads and sees only one kernel thread', 'The OS spawns a new process automatically', 'CPU execution speed doubles'],
            correct: 1,
            explanation: 'In the Many-to-One model, the OS kernel only manages the single underlying process thread; any blocking syscall halts all user threads.',
            hint: 'The kernel sees only one execution thread for the whole process.',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'What hardware feature prevents a user application process from corrupting another process or kernel memory?',
            options: ['Dual-mode CPU execution (User Mode vs Kernel Mode) paired with Base and Limit memory protection registers', 'High-speed SSD controllers', 'L3 CPU cache locking', 'Graphics card shaders'],
            correct: 0,
            explanation: 'Dual-mode CPU hardware restricts privileged instructions to Kernel mode, and MMU base/limit registers trap unauthorized memory addresses.',
            hint: 'Privilege rings and hardware memory boundary validation.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: High-Level Analysis & Complex Systems (Q15 - Q16)
          {
            question: 'Why do modern multi-core Linux systems use CFS (Completely Fair Scheduler) red-black tree structures instead of simple priority runqueues?',
            options: ['Simple runqueues cannot store threads', 'CFS tracks virtual runtime (vruntime) in a red-black tree in O(log N) to ensure fair CPU proportions without rigid time slice quantization', 'CFS disables context switching', 'Red-black trees use no memory'],
            correct: 1,
            explanation: 'CFS models an ideal multitasking CPU by continually picking the task with smallest vruntime from the leftmost node of an RB-tree in O(1) pick / O(log N) insert.',
            hint: 'Pick smallest vruntime to guarantee mathematical fairness.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'What is the security risk of a Process Injection (DLL Injection / ptrace injection) attack in operating system security?',
            options: ['It causes hardware overheating', 'An unauthorized process injects malicious code into the address space of a legitimate running process to inherit its access privileges', 'It disables keyboard inputs', 'It deletes the BIOS chip'],
            correct: 1,
            explanation: 'Process injection forces a target process to execute arbitrary payload code, bypassing security boundaries and inheriting target permissions.',
            hint: 'Injected code executes inside another trusted process boundary.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      },

      // ---------------------------------------------------------------------
      // Topic 2.2: CPU Scheduling Algorithms
      // ---------------------------------------------------------------------
      {
        title: 'CPU Scheduling Algorithms — Fairness, Throughput & Latency',
        topicName: 'CPU Scheduling Algorithms',
        difficulty: 'MEDIUM',
        transcript: `Topic: CPU Scheduling Algorithms and Performance Metrics

1. Goal of CPU Scheduling:
CPU scheduling allocates CPU cores among ready processes to optimize performance metrics:
- CPU Utilization: Percentage of time CPU is busy (aim for 40% - 90%).
- Throughput: Number of processes completed per unit time.
- Turnaround Time: Total time from process submission to completion (Turnaround = Completion Time - Arrival Time).
- Waiting Time: Total time spent waiting in the ready queue (Waiting Time = Turnaround Time - Burst Time).
- Response Time: Time from submission to first CPU execution response.

2. Preemptive vs Non-Preemptive Scheduling:
- Non-Preemptive: Once a process gets the CPU, it holds it until it terminates or blocks for I/O.
- Preemptive: The OS can interrupt a running process (e.g. on timer interrupt or higher priority arrival) and move it back to the Ready queue.

3. Standard Scheduling Algorithms:

A. First-Come, First-Served (FCFS):
- Type: Non-Preemptive.
- Mechanism: Processes executed in arrival order.
- Limitation: Convoy Effect, where short CPU-burst processes wait behind a long CPU-bound process, degrading average waiting time.

B. Shortest Job First (SJF) & Shortest Remaining Time First (SRTF):
- SJF (Non-Preemptive) / SRTF (Preemptive).
- Property: Mathematically optimal for minimizing average waiting time.
- Limitation: Requires knowing future CPU burst lengths in advance (approximated via Exponential Smoothing: tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n). Can cause starvation of long jobs.

C. Round Robin (RR):
- Type: Preemptive.
- Mechanism: Each process receives a fixed Time Quantum (typically 10 - 100 ms). If unfinished when quantum expires, it is preempted to the rear of ready queue.
- Trade-off: If quantum is too large, RR degrades to FCFS. If quantum is too small, excessive context-switch overhead cripples throughput. Rule of thumb: 80% of CPU bursts should be shorter than time quantum.

D. Priority Scheduling:
- Mechanism: CPU allocated to highest priority process.
- Starvation & Solution: Low priority jobs may wait indefinitely. Solved by Aging (gradually increasing process priority the longer it waits in the ready queue).

E. Multi-Level Feedback Queue (MLFQ):
- Mechanism: Multiple priority queues with different time quanta. I/O-bound interactive processes stay in top high-priority queues; CPU-intensive jobs migrate down to longer-quantum lower queues.

4. Quick Revision Summary:
FCFS is simple but causes convoy delays. SJF minimizes average waiting time but risks starvation. Round Robin guarantees responsiveness with time slices. MLFQ dynamically adapts to process behavior.

5. Verified Educational References:
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
          { front: 'What is Aging in CPU priority scheduling?', back: 'Gradually increasing the priority of processes that wait in the ready queue for a long time to prevent starvation.', hint: 'Older waiting processes get higher priority.' }
        ],
        quizzes: [
          // Level 1: Basic Definitions (Q1 - Q2)
          {
            question: 'How is Process Waiting Time calculated?',
            options: ['Waiting Time = Turnaround Time - Burst Time', 'Waiting Time = Completion Time + Arrival Time', 'Waiting Time = Burst Time * 2', 'Waiting Time = Arrival Time - Completion Time'],
            correct: 0,
            explanation: 'Waiting time is the total time spent in ready queue, equal to Turnaround Time minus active CPU Burst Time.',
            hint: 'Total turnaround minus the time actually running on CPU.',
            level: 1,
            difficulty: 'easy'
          },
          {
            question: 'What is the Convoy Effect in CPU scheduling?',
            options: ['Multiple CPUs executing in parallel', 'Short processes waiting a long time behind a large CPU-bound process in FCFS', 'Processes communicating via network packets', 'Memory running out of space'],
            correct: 1,
            explanation: 'In FCFS, when a long CPU-bound process holds the processor, all short I/O-bound processes queue behind it, tanking utilization.',
            hint: 'A long vehicle holding up a line of fast cars on a single-lane road.',
            level: 1,
            difficulty: 'easy'
          },
          // Level 2: Identification (Q3 - Q4)
          {
            question: 'Which scheduling algorithm is mathematically optimal for minimizing average waiting time across all processes?',
            options: ['First-Come First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Priority Scheduling without Aging'],
            correct: 1,
            explanation: 'SJF schedules short jobs first, rapidly clearing waiting queues and mathematically minimizing total cumulative wait time.',
            hint: 'Running the shortest task first clears the queue fastest.',
            level: 2,
            difficulty: 'easy'
          },
          {
            question: 'What parameter determines the maximum continuous CPU time a process receives in Round Robin scheduling?',
            options: ['Base address', 'Time Quantum (Time Slice)', 'Process ID', 'Disk sector size'],
            correct: 1,
            explanation: 'The Time Quantum (or time slice) sets the timer interrupt threshold for preempting the running process.',
            hint: 'The fixed slice of time allotted per turn.',
            level: 2,
            difficulty: 'easy'
          },
          // Level 3: Calculation & Tracing (Q5 - Q6)
          {
            question: 'Three processes arrive at time 0 with burst times P1=24ms, P2=3ms, P3=3ms. Under FCFS (P1, P2, P3), what is the average waiting time?',
            options: ['0 ms', '17 ms', '27 ms', '30 ms'],
            correct: 1,
            explanation: 'Wait times: P1=0ms, P2=24ms, P3=27ms. Total wait = 51ms. Average wait = 51 / 3 = 17ms.',
            hint: 'P1 waits 0, P2 waits 24, P3 waits 24+3=27. Average the three.',
            level: 3,
            difficulty: 'medium'
          },
          {
            question: 'For the same three processes (P1=24ms, P2=3ms, P3=3ms) arriving at time 0, what is the average waiting time under SJF (P2, P3, P1)?',
            options: ['3 ms', '6 ms', '17 ms', '27 ms'],
            correct: 0,
            explanation: 'SJF order: P2 runs (wait 0), P3 runs (wait 3), P1 runs (wait 6). Total = 9ms. Average wait = 9 / 3 = 3ms (compared to 17ms under FCFS).',
            hint: 'P2 waits 0, P3 waits 3, P1 waits 6. Average is 9 / 3.',
            level: 3,
            difficulty: 'medium'
          },
          // Level 4: Preemption & Starvation (Q7 - Q8)
          {
            question: 'What is the primary danger of static Priority Scheduling without aging?',
            options: ['High context switch overhead', 'Starvation (Indefinite Blocking) where low priority processes never get CPU time', 'Memory leaks in heap', 'CPU overheating'],
            correct: 1,
            explanation: 'If higher-priority processes arrive continuously, lower-priority processes may starve and wait indefinitely in the ready queue.',
            hint: 'Low priority tasks may never get a turn.',
            level: 4,
            difficulty: 'medium'
          },
          {
            question: 'What technique solves the starvation problem in Priority Scheduling?',
            options: ['Decreasing time quantum', 'Aging (gradually increasing the priority of processes as they wait in ready queue)', 'Preemption disablement', 'Rebooting the server'],
            correct: 1,
            explanation: 'Aging ensures that even the lowest priority task will eventually accumulate top priority and execute.',
            hint: 'Priority grows with age/waiting time.',
            level: 4,
            difficulty: 'medium'
          },
          // Level 5: Round Robin Quantum Tradeoffs (Q9 - Q10)
          {
            question: 'What happens to Round Robin scheduling performance if the Time Quantum is set to an extremely large value (e.g. infinity)?',
            options: ['It degenerates into First-Come First-Served (FCFS)', 'It behaves as Shortest Job First', 'It causes zero response time', 'It crashes the kernel'],
            correct: 0,
            explanation: 'If the quantum is larger than any burst, every process finishes in one turn without preemption, exactly like FCFS.',
            hint: 'No process is interrupted before finishing its burst.',
            level: 5,
            difficulty: 'medium'
          },
          {
            question: 'What happens if the Round Robin Time Quantum is set extremely small (e.g. 1 microsecond)?',
            options: ['Throughput increases to maximum', 'Excessive context switching overhead dominates CPU cycles and destroys throughput', 'All processes finish instantly', 'Memory consumption drops to zero'],
            correct: 1,
            explanation: 'If quantum is comparable to context switch time (e.g. 10 microseconds), the CPU spends most of its time swapping registers rather than executing code.',
            hint: 'Switching costs consume more time than actual execution.',
            level: 5,
            difficulty: 'medium'
          },
          // Level 6: Scenario-Based Analysis (Q11 - Q12)
          {
            question: 'In an interactive desktop system with typing word processors and background video rendering, why is Multi-Level Feedback Queue (MLFQ) ideal?',
            options: ['It treats all processes identically', 'Interactive I/O processes stay in top priority short-quantum queues for instant response, while batch video jobs sink to long-quantum lower queues', 'It disables background tasks', 'It uses no priority queues'],
            correct: 1,
            explanation: 'MLFQ automatically learns process behavior: interactive tasks release CPU quickly and stay top-priority; compute tasks drop down to avoid monopolizing.',
            hint: 'Interactive tasks need fast response; compute tasks need long uninterrupted slices.',
            level: 6,
            difficulty: 'medium'
          },
          {
            question: 'Which formula represents Exponential Smoothing used in SJF to predict the next CPU burst length tau_{n+1}?',
            options: ['tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n', 'tau_{n+1} = t_n + tau_n', 'tau_{n+1} = t_n / 2', 'tau_{n+1} = alpha * 100'],
            correct: 0,
            explanation: 'Exponential smoothing weights the most recent actual burst t_n with weight alpha and past history tau_n with weight (1 - alpha).',
            hint: 'Weighted combination of recent actual burst and historical predicted burst.',
            level: 6,
            difficulty: 'medium'
          },
          // Level 7: Multi-Processor Scheduling (Q13 - Q14)
          {
            question: 'What is Processor Affinity in multi-core CPU scheduling?',
            options: ['A process preference to remain running on the same CPU core to benefit from warm cache contents', 'A core running at higher voltage', 'Locking a process to disk storage', 'Disabling interrupts on secondary cores'],
            correct: 0,
            explanation: 'Keeping a process on the same core avoids invalidating and reloading L1/L2 hardware caches, boosting throughput.',
            hint: 'A process stays attached to a specific core to exploit cached data.',
            level: 7,
            difficulty: 'hard'
          },
          {
            question: 'What is the distinction between Asymmetric Multiprocessing (AMP) and Symmetric Multiprocessing (SMP)?',
            options: ['AMP uses graphics cards; SMP uses mainframes', 'In AMP, one master core handles all scheduling/I/O; in SMP, each core self-schedules from a shared or private runqueue', 'SMP has only one CPU core', 'AMP does not support threads'],
            correct: 1,
            explanation: 'SMP is standard in modern OSes where all peer cores run kernel scheduling code concurrently without a single master bottleneck.',
            hint: 'In SMP, all cores are equal peers; in AMP, a master core controls others.',
            level: 7,
            difficulty: 'hard'
          },
          // Level 8: Real-Time & Advanced Theory (Q15 - Q16)
          {
            question: 'In Hard Real-Time systems, what is the Rate Monotonic Scheduling (RMS) assignment rule?',
            options: ['Shorter period = Higher static priority', 'Longer period = Higher priority', 'Random priority', 'First come first served'],
            correct: 0,
            explanation: 'Rate Monotonic assigns static priorities inversely proportional to task periods: tasks with high frequency (short period) get highest priority.',
            hint: 'Tasks that occur most frequently get top priority.',
            level: 8,
            difficulty: 'hard'
          },
          {
            question: 'What dangerous synchronization phenomenon occurred on the Mars Pathfinder spacecraft in 1997 due to CPU scheduling?',
            options: ['Deadlock', 'Priority Inversion (a medium priority task blocked a high priority task because a low priority task held a shared mutex)', 'Thrashing', 'Buffer overflow'],
            correct: 1,
            explanation: 'Priority inversion occurred when a medium task preempted a low task holding a mutex needed by a high task. Fixed by Priority Inheritance Protocol.',
            hint: 'A medium priority task blocked high priority execution.',
            level: 8,
            difficulty: 'hard'
          }
        ]
      }
    ]
  }
];
