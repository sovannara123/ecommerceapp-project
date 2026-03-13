import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final _searchCtrl = TextEditingController();
  Timer? _debounce;
  List<String> _recentSearches = [];
  bool _loading = false;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _loadRecent();
    _searchCtrl.addListener(() {
      if (mounted) {
        setState(() {});
      }
    });
  }

  Future<void> _loadRecent() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _recentSearches = prefs.getStringList('recent_searches') ?? [];
    });
  }

  Future<void> _saveRecent(String query) async {
    _recentSearches.remove(query);
    _recentSearches.insert(0, query);
    if (_recentSearches.length > 10) {
      _recentSearches = _recentSearches.sublist(0, 10);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('recent_searches', _recentSearches);
    if (!mounted) return;
    setState(() {});
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (value.trim().isNotEmpty) {
        _performSearch(value.trim());
      }
    });
  }

  Future<void> _performSearch(String query) async {
    setState(() {
      _loading = true;
      _query = query;
    });
    await _saveRecent(query);

    try {
      await Future.delayed(const Duration(seconds: 1));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Search error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            snap: true,
            title: TextField(
              controller: _searchCtrl,
              autofocus: true,
              onChanged: _onSearchChanged,
              onSubmitted: (value) {
                if (value.trim().isNotEmpty) {
                  _performSearch(value.trim());
                }
              },
              decoration: InputDecoration(
                hintText: 'Search products...',
                border: InputBorder.none,
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _query = '');
                        },
                      )
                    : null,
              ),
            ),
          ),
          if (_loading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_query.isEmpty)
            SliverList(
              delegate: SliverChildListDelegate([
                if (_recentSearches.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Recent Searches',
                          style: theme.textTheme.titleSmall,
                        ),
                        TextButton(
                          onPressed: () async {
                            final prefs = await SharedPreferences.getInstance();
                            await prefs.remove('recent_searches');
                            if (!mounted) return;
                            setState(() => _recentSearches.clear());
                          },
                          child: const Text('Clear All'),
                        ),
                      ],
                    ),
                  ),
                  ..._recentSearches.map((search) => ListTile(
                        leading: const Icon(Icons.history),
                        title: Text(search),
                        trailing: const Icon(Icons.north_west, size: 16),
                        onTap: () {
                          _searchCtrl.text = search;
                          _performSearch(search);
                        },
                      )),
                ] else
                  const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(
                      child: Text('Start typing to search products'),
                    ),
                  ),
              ]),
            )
          else
            SliverFillRemaining(
              child: Center(
                child: Text('Results for "$_query"'),
              ),
            ),
        ],
      ),
    );
  }
}
