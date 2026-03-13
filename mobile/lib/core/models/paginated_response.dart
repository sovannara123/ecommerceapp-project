class PaginatedResponse<T> {
  const PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasMore,
  });

  final List<T> data;
  final int total;
  final int page;
  final int limit;
  final bool hasMore;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    final rawList = json['data'] ?? json['items'];

    final parsedData = rawList is List
        ? rawList
            .whereType<Map>()
            .map(
              (item) => fromJsonT(
                item.map(
                  (key, value) => MapEntry(key.toString(), value),
                ),
              ),
            )
            .toList(growable: false)
        : <T>[];

    return PaginatedResponse<T>(
      data: parsedData,
      total: _toInt(json['total']),
      page: _toInt(json['page']),
      limit: _toInt(json['limit']),
      hasMore: _toBool(json['hasMore']),
    );
  }
}

int _toInt(dynamic raw) {
  if (raw is int) return raw;
  if (raw is num) return raw.toInt();
  return int.tryParse(raw?.toString() ?? '') ?? 0;
}

bool _toBool(dynamic raw) {
  if (raw is bool) return raw;
  if (raw is num) return raw != 0;
  final value = (raw ?? '').toString().toLowerCase();
  return value == 'true' || value == '1';
}
