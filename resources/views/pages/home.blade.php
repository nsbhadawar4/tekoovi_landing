@extends('layouts.app')

@php
    use App\Support\Sections;

    // Every block below is switched from the admin's "Page Sections" panel (and
    // from the toolbar of the section that fills it).
    $pageSections = $content['pageSections'] ?? [];
    $shows = fn (string $block) => Sections::isBlockVisible($pageSections, $block);
@endphp

@section('content')
    @if ($shows('hero'))
        @include('sections.hero')
    @endif

    @if ($shows('trustedBy'))
        @include('sections.trusted-by')
    @endif

    @if ($shows('work'))
        @include('sections.featured-projects')
    @endif

    @if ($shows('services'))
        @include('sections.services')
    @endif

    @if ($shows('industries'))
        @include('sections.industries')
    @endif

    @if ($shows('why'))
        @include('sections.why')
    @endif

    @if ($shows('process'))
        @include('sections.process')
    @endif

    @if ($shows('techStack'))
        @include('sections.tech-stack')
    @endif

    @if ($shows('caseStudies'))
        @include('sections.case-studies')
    @endif

    @if ($shows('testimonials'))
        @include('sections.testimonials')
    @endif

    @if ($shows('founder'))
        @include('sections.founder')
    @endif

    @if ($shows('blog'))
        @include('sections.blog-teaser')
    @endif

    @if ($shows('faq'))
        @include('sections.faq')
    @endif
@endsection
