# quantum-discrete-treemap

demo:

https://orzechowskikamil.github.io/quantum-discrete-treemap/

I prefer name Discrete treemap because by this keyword I tried to find
this algorithm for two weeks, until I accidentally found it named
Quantum Treemap. So, final name is Quantum Discrete Treemap.

It's javascript port of Quantum Treemap algorithm, originally written in Java by
professor Benjamin B. Benderson in 2001 year. Original algorithm's
implementation was 1100 lines long, this version is shortened by removal
of debug and findAlternativeLayouts methods.

Source code for original implementation in Java is here:
https://www.cs.umd.edu/hcil/photomesa/download/quantum-treemap-source.zip

Seems that algorithm was completely forgotten: in 2019 year, original Java
implementation from 2001 is only one existing in the internet, while this
algorithm is surprisingly useful for some usecases.

Quantum Treemap is algorithm which calculate treemap layout, considering
fact that values are not represented by rectangles which sides can be
real values and area of this rectangle is equal to value of the data entry,
but rather by rectangles which amount is integer value, and side of the
rectangle can be no smaller than one rectangle's side. It's ideal
to display for example directories which contains photos, while photo
miniature has always same size, or, for example, visualize state of
many items of particular type.

Original publication for Quantum Treemap:
https://www.cs.umd.edu/hcil/photomesa/download/layout-algorithms.shtml

I added horizontal and vertical padding to the algorithm, by using this
separation between rectangles, or preserving space for labels is possible.

License
=======
This work is publicated on Mozilla Public License 2.0, as original work.
In short: You are free to use it on open source or commercial projects,
but you have to publish all your modifications to the code to the community,
and include original headers.
It's something between Apache and GPL.