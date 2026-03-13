enum NotificationType {
  order,
  promo,
  system,
  unknown,
}

class NotificationModel {
  const NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    required this.data,
    required this.isRead,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String title;
  final String body;
  final NotificationType type;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory NotificationModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    final typeValue = (json['type'] ?? '').toString();

    return NotificationModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      userId: (json['userId'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      body: (json['body'] ?? '').toString(),
      type: NotificationType.values.firstWhere(
        (e) => e.name == typeValue,
        orElse: () => NotificationType.unknown,
      ),
      data: _toMap(json['data']),
      isRead: _toBool(json['isRead']),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      updatedAt: DateTime.tryParse((json['updatedAt'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'id': id,
        'userId': userId,
        'title': title,
        'body': body,
        'type': type.name,
        'data': data,
        'isRead': isRead,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };
}

class NotificationPageModel {
  const NotificationPageModel({
    required this.items,
    required this.page,
    required this.limit,
    required this.total,
    required this.hasMore,
  });

  final List<NotificationModel> items;
  final int page;
  final int limit;
  final int total;
  final bool hasMore;

  factory NotificationPageModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    final itemsRaw = json['items'];

    return NotificationPageModel(
      items: itemsRaw is List
          ? itemsRaw.map(NotificationModel.fromJson).toList(growable: false)
          : const <NotificationModel>[],
      page: _toInt(json['page']),
      limit: _toInt(json['limit']),
      total: _toInt(json['total']),
      hasMore: _toBool(json['hasMore']),
    );
  }

  Map<String, dynamic> toJson() => {
        'items': items.map((item) => item.toJson()).toList(),
        'page': page,
        'limit': limit,
        'total': total,
        'hasMore': hasMore,
      };
}

Map<String, dynamic> _toMap(dynamic raw) {
  if (raw is Map<String, dynamic>) return raw;
  if (raw is Map) {
    return raw.map(
      (key, value) => MapEntry(key.toString(), value),
    );
  }
  return <String, dynamic>{};
}

bool _toBool(dynamic raw) {
  if (raw is bool) return raw;
  if (raw is num) return raw != 0;
  final value = (raw ?? '').toString().toLowerCase();
  return value == 'true' || value == '1';
}

int _toInt(dynamic raw) {
  if (raw is int) return raw;
  if (raw is num) return raw.toInt();
  return int.tryParse(raw?.toString() ?? '') ?? 0;
}
